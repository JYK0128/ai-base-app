import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, I18nLocale, I18nTranslation } from '@pkg/database';

import { type BulkTranslationOperation, BulkTranslationsCommand } from './bulk-translations.command';
import { BulkTranslationsAsserter } from './bulk-translations.error';

const TRANSLATION_QUERY_CHUNK_SIZE = 100;

type IdentifiedBulkTranslationOperation = BulkTranslationOperation & {
  localeCode: string
};

@CommandHandler(BulkTranslationsCommand)
export class BulkTranslationsHandler implements ICommandHandler<BulkTranslationsCommand> {
  private readonly Asserter = BulkTranslationsAsserter;

  constructor(
    @InjectRepository(I18nLocale)
    private readonly localeRepo: CoreRepository<I18nLocale>,
    @InjectRepository(I18nTranslation)
    private readonly translationRepo: CoreRepository<I18nTranslation>,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: BulkTranslationsCommand): Promise<{ processedCount: number }> {
    await this.verifyOperations(command.operations);
    const activeLocales = await this.identifyActiveLocales(command.operations);
    const translationMap = await this.identifyTranslations(command.operations);

    let processedCount = 0;

    for (const operation of command.operations) {
      const localeCode = await this.identifyActiveLocaleCode(operation.locale, activeLocales);
      const translationKey = this.buildTranslationKey(operation.namespace, operation.key, localeCode);
      const translation = translationMap.get(translationKey) ?? null;
      const identifiedOperation = {
        ...operation,
        localeCode,
      };

      await this.verifyTranslationOperation(identifiedOperation, translation);
      this.processTranslationOperation(identifiedOperation, translation, translationKey, translationMap);
      processedCount++;
    }

    await this.em.flush();

    return { processedCount };
  }

  /**
   * STEP 1: 입력 검증
   */
  private async verifyOperations(operations: BulkTranslationOperation[]): Promise<void> {
    await this.Asserter.throwIf(operations.length === 0, 'EMPTY_OPERATIONS');
  }

  /**
   * STEP 2: 활성 로케일 식별
   */
  private async identifyActiveLocales(
    operations: BulkTranslationOperation[],
  ): Promise<Map<string, I18nLocale>> {
    const localeCodes = [...new Set(operations.map((operation) => operation.locale))];

    if (localeCodes.length === 0) {
      return new Map();
    }

    const locales = await this.localeRepo.find({
      code: { $in: localeCodes },
      isActive: true,
    });

    return new Map(locales.map((locale) => [locale.code, locale]));
  }

  /**
   * STEP 3: 기존 번역 일괄 식별
   */
  private async identifyTranslations(
    operations: BulkTranslationOperation[],
  ): Promise<Map<string, I18nTranslation>> {
    const conditions = this.buildTranslationConditions(operations);

    if (conditions.length === 0) {
      return new Map();
    }

    const translations = new Map<string, I18nTranslation>();

    for (const conditionChunk of this.chunkTranslationConditions(conditions)) {
      const chunkTranslations = await this.translationRepo.find({
        deletedAt: null,
        $or: conditionChunk,
      });

      for (const translation of chunkTranslations) {
        translations.set(
          this.buildTranslationKey(translation.namespace, translation.key, translation.localeCode),
          translation,
        );
      }
    }

    return translations;
  }

  /**
   * STEP 4: 액션별 번역 검증
   */
  private async verifyTranslationOperation(
    operation: IdentifiedBulkTranslationOperation,
    translation: I18nTranslation | null,
  ): Promise<void> {
    if (operation.action === 'CREATE' || operation.action === 'UPDATE') {
      await this.Asserter.throwIf(!operation.value, 'VALUE_REQUIRED');
    }

    if (operation.action === 'CREATE') {
      await this.Asserter.throwIf(!!translation, 'TRANSLATION_ALREADY_EXISTS');
      return;
    }

    await this.Asserter.assert(translation, 'TRANSLATION_NOT_FOUND');
  }

  /**
   * STEP 5: 액션별 번역 처리
   */
  private processTranslationOperation(
    operation: IdentifiedBulkTranslationOperation,
    translation: I18nTranslation | null,
    translationKey: string,
    translationMap: Map<string, I18nTranslation>,
  ): void {
    switch (operation.action) {
      case 'CREATE':
        translationMap.set(translationKey, this.translationRepo.create({
          namespace: operation.namespace,
          key: operation.key,
          localeCode: operation.localeCode,
          value: operation.value!,
        }));
        return;
      case 'UPDATE':
        if (!translation) return;
        translation.value = operation.value!;
        translationMap.set(translationKey, translation);
        return;
      case 'DELETE':
        translation!.delete();
        translationMap.delete(translationKey);
    }
  }

  private async identifyActiveLocaleCode(
    locale: string,
    activeLocales: Map<string, I18nLocale>,
  ) {
    const active = await this.Asserter.assert(activeLocales.get(locale) ?? null, 'INVALID_LOCALE');
    return active.code;
  }

  private buildTranslationConditions(operations: BulkTranslationOperation[]) {
    const conditions = new Map<string, { namespace: string, key: string, localeCode: string }>();

    for (const operation of operations) {
      const translationKey = this.buildTranslationKey(operation.namespace, operation.key, operation.locale);
      conditions.set(translationKey, {
        namespace: operation.namespace,
        key: operation.key,
        localeCode: operation.locale,
      });
    }

    return [...conditions.values()];
  }

  private chunkTranslationConditions(
    conditions: Array<{ namespace: string, key: string, localeCode: string }>,
  ) {
    const chunks: Array<Array<{ namespace: string, key: string, localeCode: string }>> = [];

    for (let index = 0; index < conditions.length; index += TRANSLATION_QUERY_CHUNK_SIZE) {
      chunks.push(conditions.slice(index, index + TRANSLATION_QUERY_CHUNK_SIZE));
    }

    return chunks;
  }

  private buildTranslationKey(namespace: string, key: string, localeCode: string) {
    return `${namespace}::${key}::${localeCode}`;
  }
}
