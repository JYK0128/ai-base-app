import { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { I18nTranslation, I18nTranslationRepository } from '@pkg/database';

import { GetTranslationAsserter } from './get-translation.error';
import { GetTranslationQuery } from './get-translation.query';

export type I18nTranslationSingleResult = Record<string, Record<string, Record<string, string>>>;

@QueryHandler(GetTranslationQuery)
export class GetTranslationHandler implements IQueryHandler<GetTranslationQuery> {
  private readonly Asserter = GetTranslationAsserter;

  constructor(
    @InjectRepository(I18nTranslation)
    private readonly translationRepo: I18nTranslationRepository,
  ) {}

  async execute(query: GetTranslationQuery): Promise<I18nTranslationSingleResult> {
    await this.validateNamespacePresent(query.namespace);
    await this.validateKeyPresent(query.key);

    const records = await this.identifyTranslations(
      query.namespace,
      query.key,
      query.locale,
    );

    return this.processLocaleTranslations(records);
  }

  private async validateNamespacePresent(namespace: string) {
    await this.Asserter.throwIf(!namespace, 'INVALID_NAMESPACE');
  }

  private async validateKeyPresent(key: string) {
    await this.Asserter.throwIf(!key, 'INVALID_KEY');
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
