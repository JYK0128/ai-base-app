import { InternalServerErrorException, Type } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';

/**
 * 에러 정의 구조: 메시지는 필수이며, 예외 클래스는 선택 사항입니다.
 * 문자열, 다국어 딕셔너리, 혹은 메타데이터와 언어를 전달받는 콜백 함수를 가질 수 있습니다.
 */
export type ErrorDetail = {
  message: string | Record<string, string> | ((metadata?: never, lang?: string) => string)
  exception?: Type<unknown>
};

/**
 * 에러 사전을 정의하는 헬퍼 함수입니다.
 */
export function defineErrors<T extends Record<string, ErrorDetail>>(errors: T): T {
  return errors;
}

/**
 * 어서터 동작 옵션
 */
export type AsserterOptions<M, C> = {
  metadata?: M
  context?: C
};

/**
 * 비즈니스 규칙을 검증하고 상황에 맞는 예외를 발생시키는 실무자 클래스입니다.
 */
export class ExceptionAsserter<
  T extends Record<string, ErrorDetail>,
  M = unknown,
  C = unknown,
> {
  private onFailHook?: (args: { code: keyof T, metadata?: M, context?: C }) => Promise<void> | void;

  constructor(private readonly messages: T) {}

  /**
   * 실패 시 실행할 부수 효과(Hook)를 등록합니다.
   */
  onFail(hook: (args: { code: keyof T, metadata?: M, context?: C }) => Promise<void> | void): this {
    this.onFailHook = hook;
    return this;
  }

  /**
   * 비즈니스 예외 객체를 생성합니다.
   */
  private create(code: keyof T, metadata?: M): unknown {
    const { message, exception = InternalServerErrorException } = this.messages[code];
    const Constructor = exception as new (args: Record<string, unknown>) => unknown;

    let lang = 'ko';
    try {
      const cls = ClsServiceManager.getClsService();
      if (cls && cls.isActive()) {
        const acceptLanguage = cls.get('acceptLanguage');
        if (acceptLanguage) {
          lang = acceptLanguage.toLowerCase().startsWith('en') ? 'en' : 'ko';
        }
      }
    }
    catch {
      // ClsService가 비활성 상태일 때 폴백
    }

    let resolvedMessage: string;
    if (typeof message === 'function') {
      resolvedMessage = (message as (metadata?: unknown, lang?: string) => string)(metadata, lang);
    }
    else if (typeof message === 'object' && message) {
      resolvedMessage = message[lang] ?? message['ko'] ?? Object.values(message)[0] ?? '';
    }
    else {
      resolvedMessage = message;
    }

    return new Constructor({
      message: resolvedMessage,
      code,
      details: metadata,
    });
  }

  /**
   * 조건이 참(true)이면 예외를 발생시킵니다.
   */
  async throwIf(condition: boolean, code: keyof T, options?: AsserterOptions<M, C>): Promise<void> {
    if (condition) {
      const { metadata, context } = options || {};
      await this.onFailHook?.({ code, metadata, context });
      throw this.create(code, metadata);
    }
  }

  /**
   * 즉시 예외를 발생시킵니다.
   */
  async throw(code: keyof T, options?: AsserterOptions<M, C>): Promise<never> {
    const { metadata, context } = options || {};
    await this.onFailHook?.({ code, metadata, context });
    throw this.create(code, metadata) as Error;
  }

  /**
   * 값이 유효하지 않거나 Promise가 거절되면 예외를 발생시키고, 유효하면 값을 반환합니다.
   */
  async assert<V>(
    condition: Promise<V | null | undefined> | V | null | undefined,
    code: keyof T,
    options?: AsserterOptions<M, C>,
  ): Promise<V> {
    const value = await Promise.resolve(condition)
      .catch(async () => {
        const { metadata, context } = options || {};
        await this.onFailHook?.({ code, metadata, context });
        throw this.create(code, metadata);
      });

    if (!value) {
      const { metadata, context } = options || {};
      await this.onFailHook?.({ code, metadata, context });
      throw this.create(code, metadata);
    }
    return value as V;
  }
}

/**
 * 타입 안전한 가드 생성을 위한 빌더 클래스입니다.
 */
class ExceptionGuardBuilder<M = unknown, C = unknown> {
  /**
   * 외부 노출용 메타데이터 타입을 지정합니다.
   */
  withMetadata<NewM>(): ExceptionGuardBuilder<NewM, C> {
    return new ExceptionGuardBuilder<NewM, C>();
  }

  /**
   * 내부 로직용 컨텍스트 타입을 지정합니다.
   */
  withContext<NewC>(): ExceptionGuardBuilder<M, NewC> {
    return new ExceptionGuardBuilder<M, NewC>();
  }

  /**
   * 에러 메시지 사전을 설정하고 최종 비즈니스 단언자(Asserter)를 생성합니다.
   */
  setMessages<T extends Record<string, ErrorDetail>>(messages: T): ExceptionAsserter<T, M, C> {
    return new ExceptionAsserter<T, M, C>(messages);
  }
}

/**
 * ExceptionGuard 진입점 (싱글톤 빌더)
 */
export const ExceptionGuard = new ExceptionGuardBuilder();
