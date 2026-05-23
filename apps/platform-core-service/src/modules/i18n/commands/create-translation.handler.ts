import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { I18nLocale, I18nLocaleRepository, I18nTranslation, I18nTranslationRepository } from '@pkg/database';

import { CreateTranslationCommand } from './create-translation.command';
import { CreateTranslationAsserter } from './create-translation.error';

@CommandHandler(CreateTranslationCommand)
export class CreateTranslationHandler implements ICommandHandler<CreateTranslationCommand> {
  private readonly Asserter = CreateTranslationAsserter;

  constructor(
    @InjectRepository(I18nLocale)
    private readonly localeRepo: I18nLocaleRepository,
    @InjectRepository(I18nTranslation)
    private readonly translationRepo: I18nTranslationRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateTranslationCommand): Promise<{ id: string }> {
    await this.validateNamespacePresent(command.namespace);
    await this.validateKeyPresent(command.key);
    await this.validateTranslationValueType(command.value);

    const localeCode = await this.identifyActiveLocaleCode(command.locale);
    await this.validateNoDuplicateTranslation(command.namespace, command.key, localeCode);

    const translation = this.translationRepo.create({
      namespace: command.namespace,
      key: command.key,
      localeCode,
      value: command.value,
    });

    return { id: translation.id };
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

  private async validateNoDuplicateTranslation(
    namespace: string,
    key: string,
    localeCode: string,
  ) {
    const record = await this.identifyTranslation(namespace, key, localeCode);
    await this.Asserter.throwIf(!!record, 'TRANSLATION_ALREADY_EXISTS');
  }

  private async identifyTranslation(
    namespace: string,
    key: string,
    localeCode: string,
  ) {
    return this.translationRepo.findOne({
      namespace,
      key,
      localeCode,
      deletedAt: null,
    });
  }
}
