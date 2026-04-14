export type MessageLeaf = string;
export type MessageValue = MessageLeaf | MessageTree;
export interface MessageTree {
  [key: string]: MessageValue;
}

export interface MessageSource {
  namespace: string;
  locale: string;
  messages: MessageTree;
}

export interface I18nMessageRecord {
  locale: string;
  namespace: string;
  key: string;
  message: string;
}

export interface I18nMessageRepository {
  findMany(params?: { locale?: string; namespace?: string }): Promise<I18nMessageRecord[]>;
  upsertMany(records: I18nMessageRecord[]): Promise<void>;
}

interface MessageEntry {
  [namespace: string]: MessageTree;
}

const isObject = (value: MessageValue): value is MessageTree => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const deepClone = (value: MessageTree): MessageTree => structuredClone(value);

const deepMerge = (
  target: MessageTree,
  source: MessageTree,
  path: string[] = [],
): MessageTree => {
  const merged = deepClone(target);

  for (const [key, sourceValue] of Object.entries(source)) {
    const currentPath = [...path, key];
    const targetValue = merged[key];

    if (targetValue === undefined) {
      merged[key] = isObject(sourceValue) ? deepClone(sourceValue) : sourceValue;
      continue;
    }

    if (isObject(targetValue) && isObject(sourceValue)) {
      merged[key] = deepMerge(targetValue, sourceValue, currentPath);
      continue;
    }

    if (!isObject(targetValue) && !isObject(sourceValue)) {
      merged[key] = sourceValue;
      continue;
    }

    throw new Error(
      `i18n 메시지 병합 충돌: "${currentPath.join('.')}" 경로의 타입이 일치하지 않습니다.`,
    );
  }

  return merged;
};

const resolvePath = (messages: MessageTree, path: string): MessageLeaf | undefined => {
  const segments = path.split('.').filter(Boolean);
  let cursor: MessageValue = messages;

  for (const segment of segments) {
    if (!isObject(cursor)) {
      return undefined;
    }

    cursor = cursor[segment] as MessageValue;

    if (cursor === undefined) {
      return undefined;
    }
  }

  return typeof cursor === 'string' ? cursor : undefined;
};

const unflattenMessages = (records: I18nMessageRecord[]): MessageTree => {
  const tree: MessageTree = {};

  for (const record of records) {
    const segments = record.key.split('.').filter(Boolean);

    if (!segments.length) {
      continue;
    }

    let cursor: MessageTree = tree;

    for (const [index, segment] of segments.entries()) {
      const isLast = index === segments.length - 1;

      if (isLast) {
        cursor[segment] = record.message;
        continue;
      }

      const next = cursor[segment];
      if (!isObject(next)) {
        cursor[segment] = {};
      }

      cursor = cursor[segment] as MessageTree;
    }
  }

  return tree;
};

const flattenMessages = (
  locale: string,
  namespace: string,
  messages: MessageTree,
  parentKey?: string,
): I18nMessageRecord[] => {
  const records: I18nMessageRecord[] = [];

  for (const [key, value] of Object.entries(messages)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (isObject(value)) {
      records.push(...flattenMessages(locale, namespace, value, fullKey));
      continue;
    }

    records.push({
      locale,
      namespace,
      key: fullKey,
      message: value,
    });
  }

  return records;
};

export class I18nMessageManager {
  protected readonly locales = new Map<string, MessageEntry>();

  register({ locale, namespace, messages }: MessageSource): void {
    const prevLocale = this.locales.get(locale) ?? {};
    const prevMessages = prevLocale[namespace] ?? {};

    this.locales.set(locale, {
      ...prevLocale,
      [namespace]: deepMerge(prevMessages, messages),
    });
  }

  registerMany(sources: MessageSource[]): void {
    for (const source of sources) {
      this.register(source);
    }
  }

  getLocaleMessages(locale: string): MessageEntry {
    return deepClone(this.locales.get(locale) ?? {});
  }

  getNamespaces(locale: string): string[] {
    return Object.keys(this.locales.get(locale) ?? {});
  }

  translate(
    locale: string,
    key: string,
    options?: { namespace?: string; fallbackLocale?: string; fallback?: string },
  ): string {
    const fallback = options?.fallback ?? key;

    if (options?.namespace) {
      const localeMessages = this.locales.get(locale)?.[options.namespace];
      const localeValue = localeMessages ? resolvePath(localeMessages, key) : undefined;

      if (localeValue) {
        return localeValue;
      }

      if (options.fallbackLocale) {
        const fallbackMessages = this.locales.get(options.fallbackLocale)?.[options.namespace];
        const fallbackValue = fallbackMessages
          ? resolvePath(fallbackMessages, key)
          : undefined;

        if (fallbackValue) {
          return fallbackValue;
        }
      }

      return fallback;
    }

    const messageEntries = this.locales.get(locale);
    if (messageEntries) {
      for (const namespace of Object.keys(messageEntries)) {
        const localeValue = resolvePath(messageEntries[namespace] as MessageTree, key);
        if (localeValue) {
          return localeValue;
        }
      }
    }

    if (options?.fallbackLocale) {
      const fallbackEntries = this.locales.get(options.fallbackLocale);
      if (fallbackEntries) {
        for (const namespace of Object.keys(fallbackEntries)) {
          const fallbackValue = resolvePath(fallbackEntries[namespace] as MessageTree, key);
          if (fallbackValue) {
            return fallbackValue;
          }
        }
      }
    }

    return fallback;
  }
}

export class DatabaseI18nMessageManager extends I18nMessageManager {
  constructor(private readonly repository: I18nMessageRepository) {
    super();
  }

  async syncFromDatabase(params?: { locale?: string; namespace?: string }): Promise<void> {
    const records = await this.repository.findMany(params);
    const grouped = new Map<string, I18nMessageRecord[]>();

    for (const record of records) {
      const groupKey = `${record.locale}::${record.namespace}`;
      const group = grouped.get(groupKey) ?? [];
      group.push(record);
      grouped.set(groupKey, group);
    }

    for (const [groupKey, groupRecords] of grouped.entries()) {
      const [locale, namespace] = groupKey.split('::');
      this.register({
        locale: locale as string,
        namespace: namespace as string,
        messages: unflattenMessages(groupRecords),
      });
    }
  }

  async registerAndPersist(source: MessageSource): Promise<void> {
    this.register(source);
    const records = flattenMessages(source.locale, source.namespace, source.messages);
    await this.repository.upsertMany(records);
  }

  async registerManyAndPersist(sources: MessageSource[]): Promise<void> {
    this.registerMany(sources);
    const records = sources.flatMap((source) => (
      flattenMessages(source.locale, source.namespace, source.messages)
    ));

    await this.repository.upsertMany(records);
  }
}

export const createI18nMessageManager = (): I18nMessageManager => new I18nMessageManager();

export const createDatabaseI18nMessageManager = (
  repository: I18nMessageRepository,
): DatabaseI18nMessageManager => new DatabaseI18nMessageManager(repository);
