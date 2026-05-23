import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { I18nLocale, I18nLocaleRepository, I18nTranslation, I18nTranslationRepository } from '@pkg/database';

import { BulkTranslationsCommand } from './bulk-translations.command';
import { BulkTranslationsAsserter } from './bulk-translations.error';

@CommandHandler(BulkTranslationsCommand)
export class BulkTranslationsHandler implements ICommandHandler<BulkTranslationsCommand> {
  private readonly Asserter = BulkTranslationsAsserter;

  constructor(
    @InjectRepository(I18nLocale)
    private readonly localeRepo: I18nLocaleRepository,
    @InjectRepository(I18nTranslation)
    private readonly translationRepo: I18nTranslationRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: BulkTranslationsCommand): Promise<{ processedCount: number }> {
    await this.Asserter.throwIf(!command.operations || command.operations.length === 0, 'EMPTY_OPERATIONS');

    let processedCount = 0;

    for (const operation of command.operations) {
      const localeCode = await this.identifyActiveLocaleCode(operation.locale);
      const action = operation.action;
      const namespace = operation.namespace?.trim();
      const key = operation.key?.trim();
      const value = operation.value?.trim();

      await this.Asserter.throwIf(!namespace, 'INVALID_NAMESPACE');
      await this.Asserter.throwIf(!key, 'INVALID_KEY');
      await this.Asserter.throwIf(!action || !['CREATE', 'UPDATE', 'DELETE'].includes(action), 'INVALID_OPERATION');

      if (action === 'CREATE' || action === 'UPDATE') {
        await this.Asserter.throwIf(!value, 'VALUE_REQUIRED');
      }

      const existing = await this.translationRepo.findOne({
        namespace,
        key,
        localeCode,
        deletedAt: null,
      });

      if (action === 'CREATE') {
        await this.Asserter.throwIf(!!existing, 'TRANSLATION_ALREADY_EXISTS');

        this.translationRepo.create({
          namespace,
          key,
          localeCode,
          value: value as string,
        });
        processedCount++;
        continue;
      }

      if (action === 'UPDATE') {
        const translation = await this.Asserter.assert(existing, 'TRANSLATION_NOT_FOUND');
        translation.value = value as string;
        processedCount++;
        continue;
      }

      const translation = await this.Asserter.assert(existing, 'TRANSLATION_NOT_FOUND');
      translation.deletedAt = new Date();
      processedCount++;
    }

    await this.em.flush();

    return { processedCount };
  }

  private async identifyActiveLocaleCode(locale: string) {
    const record = await this.localeRepo.findOne({ code: locale, isActive: true });
    const active = await this.Asserter.assert(record, 'INVALID_LOCALE');
    return active.code;
  }
}
