import { CollectionHelper } from '../core/collection-helper';
import { KeyHelper } from '../core/key-helper';
import { TreeHelper } from '../core/tree-helper';
import type { MessageEntry, MessageSource, MessageStore, MessageTree } from './message-manager.types';

/**
 * 인메모리 메시지 레지스트리 및 번역 엔진
 */
export class MessageRegistry {
  /** 로케일별 네임스페이스(MessageEntry) 맵 */
  protected readonly locales = new Map<string, MessageEntry>();

  /**
   * 메시지 소스를 레지스트리에 등록/업데이터합니다.
   */
  register({ locale, namespace, messages }: MessageSource): void {
    const prevLocale = this.locales.get(locale) ?? {};
    const prevMessages = prevLocale[namespace] ?? {};

    this.locales.set(locale, {
      ...prevLocale,
      [namespace]: TreeHelper.merge(prevMessages, messages),
    });
  }

  /**
   * 다수의 메시지 소스를 일괄 등록합니다.
   */
  registerMany(sources: MessageSource[]): void {
    for (const source of sources) {
      this.register(source);
    }
  }

  /**
   * 특정 로케일의 모든 네임스페이스 메시지를 깊은 복사하여 반환합니다.
   */
  getLocaleMessages(locale: string): MessageEntry {
    const entry = this.locales.get(locale);
    return TreeHelper.clone(entry) ?? {};
  }

  /**
   * 특정 로케일에 등록된 네임스페이스 목록을 반환합니다.
   */
  getNamespaces(locale: string): string[] {
    return Object.keys(this.locales.get(locale) ?? {});
  }

  /**
   * 메시지 번역(조회)을 수행합니다.
   * 1. 지정된 로케일의 네임스페이스에서 검색
   * 2. 네임스페이스 미지정 시 해당 로케일의 모든 네임스페이스 검색
   * 3. 검색 실패 시 폴백 로케일에서 동일 과정 반복
   * 4. 최종 실패 시 fallback 문자열 반환
   */
  translate(
    locale: string,
    key: string,
    options?: { namespace?: string, fallbackLocale?: string, fallback?: string },
  ): string {
    const fallback = options?.fallback ?? key;

    const value = this.resolveValue(locale, key, options?.namespace);
    if (value) {
      return value;
    }

    if (options?.fallbackLocale) {
      const fallbackValue = this.resolveValue(options.fallbackLocale, key, options.namespace);
      if (fallbackValue) {
        return fallbackValue;
      }
    }

    return fallback;
  }

  /**
   * 내부적인 탐색 로직을 수행합니다.
   */
  private resolveValue(locale: string, key: string, namespace?: string): string | undefined {
    const entries = this.locales.get(locale);
    if (!entries) {
      return undefined;
    }

    if (namespace) {
      return TreeHelper.get<string>(entries[namespace], key) ?? undefined;
    }

    for (const ns of Object.keys(entries)) {
      const tree = entries[ns];
      if (tree) {
        const value = TreeHelper.get<string>(tree, key);
        if (value !== null && value !== undefined) {
          return value;
        }
      }
    }

    return undefined;
  }
}

/**
 * 데이터베이스 동기화 기능이 추가된 메시지 서비스
 */
export class MessageService extends MessageRegistry {
  constructor(private readonly store: MessageStore) {
    super();
  }

  /**
   * 데이터베이스로부터 메시지 데이터를 읽어와 메모리에 동기화합니다.
   */
  async syncFromDatabase(params?: { locale?: string, namespace?: string }): Promise<void> {
    const records = await this.store.findMany(params);
    const grouped = CollectionHelper.groupBy(records, (r) => KeyHelper.join(r.locale, r.namespace));

    for (const [groupKey, groupRecords] of grouped.entries()) {
      const [locale, namespace] = KeyHelper.split(groupKey);
      this.register({
        locale: locale,
        namespace: namespace,
        messages: TreeHelper.unflatten<string>(
          groupRecords.map((r) => ({ key: r.key, value: r.message })),
        ) as MessageTree,
      });
    }
  }

  /**
   * 메시지를 등록하고 동시에 데이터베이스에 저장(UPSERT)합니다.
   */
  async registerAndPersist(source: MessageSource): Promise<void> {
    this.register(source);
    const records = TreeHelper.flatten<string>(source.messages).map((r) => ({
      locale: source.locale,
      namespace: source.namespace,
      key: r.key,
      message: r.value ?? '',
    }));
    await this.store.upsertMany(records);
  }

  /**
   * 다수의 메시지 소스를 등록하고 일괄적으로 데이터베이스에 저장합니다.
   */
  async registerManyAndPersist(sources: MessageSource[]): Promise<void> {
    this.registerMany(sources);
    const records = sources.flatMap((source) => (
      TreeHelper.flatten<string>(source.messages).map((r) => ({
        locale: source.locale,
        namespace: source.namespace,
        key: r.key,
        message: r.value ?? '',
      }))
    ));

    await this.store.upsertMany(records);
  }
}

/**
 * 인메모리 메시지 레지스트리 팩토리
 */
export const createMessageRegistry = (): MessageRegistry => new MessageRegistry();

/**
 * DB 연결형 메시지 서비스 팩토리
 */
export const createMessageService = (
  store: MessageStore,
): MessageService => new MessageService(store);
