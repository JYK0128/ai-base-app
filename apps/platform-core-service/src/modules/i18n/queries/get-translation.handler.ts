import { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, I18nTranslation } from '@pkg/database';

import { GetTranslationQuery } from './get-translation.query';

export type I18nTranslationSingleResult = Record<string, Record<string, Record<string, string>>>;

@QueryHandler(GetTranslationQuery)
export class GetTranslationHandler implements IQueryHandler<GetTranslationQuery> {
  constructor(
    @InjectRepository(I18nTranslation)
    private readonly translationRepo: CoreRepository<I18nTranslation>,
  ) {}

  async execute(query: GetTranslationQuery): Promise<I18nTranslationSingleResult> {
    const records = await this.identifyTranslations(
      query.namespace,
      query.key,
      query.locale,
    );

    return this.processLocaleTranslations(records);
  }

  private async identifyTranslations(
    namespace: string,
    key: string,
    locale?: string,
  ) {
    const where: FilterQuery<I18nTranslation> = {
      namespace,
      key,
      deletedAt: null,
    };

    if (locale) {
      const localeCodes = locale.split(',').map((l) => l.trim()).filter(Boolean);
      if (localeCodes.length > 0) {
        where.localeCode = { $in: localeCodes };
      }
    }

    const records = await this.translationRepo.find(where);

    if (records.length === 0) {
      throw new NotFoundException('번역을 찾을 수 없습니다.');
    }

    return records;
  }

  private processLocaleTranslations(records: I18nTranslation[]) {
    const result: I18nTranslationSingleResult = {};
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
