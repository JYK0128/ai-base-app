import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { I18nLocale, I18nLocaleRepository, I18nTranslation, I18nTranslationRepository } from '@pkg/database';

import { UpdateTranslationCommand } from './update-translation.command';
import { UpdateTranslationAsserter } from './update-translation.error';

@CommandHandler(UpdateTranslationCommand)
export class UpdateTranslationHandler implements ICommandHandler<UpdateTranslationCommand> {
  private readonly Asserter = UpdateTranslationAsserter;

  constructor(
    @InjectRepository(I18nLocale)
    private readonly localeRepo: I18nLocaleRepository,
    @InjectRepository(I18nTranslation)
    private readonly translationRepo: I18nTranslationRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: UpdateTranslationCommand): Promise<{ id: string }> {
    await this.validateNamespacePresent(command.namespace);
    await this.validateKeyPresent(command.key);
    await this.validateTranslationValueType(command.value);

    const localeCode = await this.identifyActiveLocaleCode(command.locale);
    const identified = await this.identifyTranslation(command.namespace, command.key, localeCode);

    identified.value = command.value;

    return { id: identified.id };
  }

  private async validateNamespacePresent(namespace?: string) {
    await this.Asserter.throwIf(!namespace, 'INVALID_NAMESPACE');
  }

  private async validateKeyPresent(key?: string) {
    await this.Asserter.throwIf(!key, 'INVALID_KEY');
  }

  private async validateTranslationValueType(value?: string) {
    await this.Asserter.throwIf(typeof value !== 'string', 'VALUE_REQUIRED');
  }

  private async identifyActiveLocaleCode(locale: string) {
    const record = await this.localeRepo.findOne({ code: locale, isActive: true });
    const active = await this.Asserter.assert(record, 'INVALID_LOCALE');
    return active.code;
  }

  private async identifyTranslation(
    namespace: string,
    key: string,
    localeCode: string,
  ) {
    const record = await this.translationRepo.findOne({
      namespace,
      key,
      localeCode,
      deletedAt: null,
    });
    return this.Asserter.assert(record, 'TRANSLATION_NOT_FOUND');
  }
}
