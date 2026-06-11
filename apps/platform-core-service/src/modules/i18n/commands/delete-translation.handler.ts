import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { I18nLocale, I18nLocaleRepository, I18nTranslation, I18nTranslationRepository } from '@pkg/database';

import { DeleteTranslationCommand } from './delete-translation.command';
import { DeleteTranslationAsserter } from './delete-translation.error';

@CommandHandler(DeleteTranslationCommand)
export class DeleteTranslationHandler implements ICommandHandler<DeleteTranslationCommand> {
  private readonly Asserter = DeleteTranslationAsserter;

  constructor(
    @InjectRepository(I18nLocale)
    private readonly localeRepo: I18nLocaleRepository,
    @InjectRepository(I18nTranslation)
    private readonly translationRepo: I18nTranslationRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: DeleteTranslationCommand): Promise<{ id: string }> {
    const localeCode = await this.identifyActiveLocaleCode(command.locale);
    const translation = await this.identifyTranslation(command.namespace, command.key, localeCode);

    this.softDeleteTranslation(translation);

    return { id: translation.id };
  }

  private async identifyActiveLocaleCode(locale: string) {
    const record: I18nLocale | null = await this.localeRepo.findOne({ code: locale, isActive: true });
    const active = await this.Asserter.assert(record, 'INVALID_LOCALE');
    return active.code;
  }

  private async identifyTranslation(namespace: string, key: string, localeCode: string): Promise<I18nTranslation> {
    const record: I18nTranslation | null = await this.translationRepo.findOne({
      namespace,
      key,
      localeCode,
      deletedAt: null,
    });
    return await this.Asserter.assert(record, 'TRANSLATION_NOT_FOUND');
  }

  /**
   * 번역 레코드를 soft delete 합니다.
   */
  private softDeleteTranslation(translation: I18nTranslation): void {
    translation.delete();
  }
}
