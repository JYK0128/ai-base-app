import { InternalServerErrorException, Type } from '@nestjs/common';

/**
 * 에러 정의 구조: 메시지는 필수이며, 예외 클래스는 선택 사항입니다.
 */
export type ErrorDetail = {
  message: string
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

    return new Constructor({
      message,
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
   * 값이 유효하지 않으면 예외를 발생시키고, 유효하면 값을 반환합니다.
   */
  async assert<V>(condition: V | null | undefined, code: keyof T, options?: AsserterOptions<M, C>): Promise<V> {
    if (!condition) {
      const { metadata, context } = options || {};
      await this.onFailHook?.({ code, metadata, context });
      throw this.create(code, metadata);
    }
    return condition as V;
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
