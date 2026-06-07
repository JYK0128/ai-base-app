import { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { I18nTranslation, I18nTranslationRepository } from '@pkg/database';

import { GetTranslationsQuery } from './get-translations.query';

export type I18nTranslationListResult = Record<string, Record<string, Record<string, string>>>;

@QueryHandler(GetTranslationsQuery)
export class GetTranslationsHandler implements IQueryHandler<GetTranslationsQuery> {
  constructor(
    @InjectRepository(I18nTranslation)
    private readonly translationRepo: I18nTranslationRepository,
  ) {}

  async execute(query: GetTranslationsQuery): Promise<I18nTranslationListResult> {
    const records = await this.identifyTranslations(query);
    return this.processTranslationList(records);
  }

  private async identifyTranslations(query: GetTranslationsQuery): Promise<I18nTranslation[]> {
    const where: FilterQuery<I18nTranslation> = {
      deletedAt: null,
    };

    const namespace = query.namespace;

    if (namespace) {
      where.namespace = namespace;
    }

    // 🌟 1. locale 조건 처리 (콤마로 구분된 여러 개 또는 단건)
    if (query.locale) {
      const localeCodes = query.locale.split(',').map((l) => l.trim()).filter(Boolean);
      if (localeCodes.length > 0) {
        where.localeCode = { $in: localeCodes };
      }
    }

    // 🌟 2. keys 조건 처리
    if (query.keys && query.keys.length > 0) {
      const conditions: FilterQuery<I18nTranslation>[] = query.keys.map((rawKey) =>
        namespace
          ? { namespace: namespace, key: rawKey }
          : { key: rawKey },
      );
      where.$or = conditions;
    }

    return this.translationRepo.find(where);
  }

  private processTranslationList(records: I18nTranslation[]): I18nTranslationListResult {
    const result: I18nTranslationListResult = {};
    for (const record of records) {
      if (!result[record.localeCode]) {
        result[record.localeCode] = {};
      }

      if (!result[record.localeCode][record.namespace]) {
        result[record.localeCode][record.namespace] = {};
      }

      result[record.localeCode][record.namespace][record.key] = record.value;
    }
    return result;
  }
}
