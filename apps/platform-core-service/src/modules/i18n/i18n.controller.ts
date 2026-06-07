import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { BulkTranslationsCommand,
         CreateTranslationCommand,
         DeleteTranslationCommand,
         UpdateTranslationCommand } from './commands';
import { I18N_SERVICE_PATTERNS } from './i18n.contract';
import { GetLocalesQuery } from './queries';
import { GetTranslationQuery } from './queries';
import { GetTranslationsQuery } from './queries';

@Controller()
export class I18nController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(I18N_SERVICE_PATTERNS.LOCALES.GET)
  getLocales() {
    return this.queryBus.execute(new GetLocalesQuery());
  }

  @MessagePattern(I18N_SERVICE_PATTERNS.TRANSLATIONS.GET_ONE)
  getTranslation(
    @Payload() data: { namespace: string, key: string, locale: string },
  ) {
    return this.queryBus.execute(new GetTranslationQuery(
      data.namespace,
      data.key,
      data.locale,
    ));
  }

  @MessagePattern(I18N_SERVICE_PATTERNS.TRANSLATIONS.GET_MANY)
  getTranslations(
    @Payload() data: { namespace?: string, keys?: string[], locale?: string },
  ) {
    return this.queryBus.execute(new GetTranslationsQuery(
      data.namespace,
      data.keys,
      data.locale,
    ));
  }

  @MessagePattern(I18N_SERVICE_PATTERNS.TRANSLATIONS.BULK)
  bulkTranslations(
    @Payload() data: { operations: Array<{ action: 'CREATE' | 'UPDATE' | 'DELETE', namespace: string, key: string, locale: string, value?: string }> },
  ) {
    return this.commandBus.execute(new BulkTranslationsCommand(data.operations));
  }

  @MessagePattern(I18N_SERVICE_PATTERNS.TRANSLATIONS.CREATE)
  createTranslation(
    @Payload() data: { namespace: string, key: string, locale: string, value: string },
  ) {
    return this.commandBus.execute(new CreateTranslationCommand(
      data.namespace,
      data.key,
      data.locale,
      data.value,
    ));
  }

  @MessagePattern(I18N_SERVICE_PATTERNS.TRANSLATIONS.UPDATE)
  updateTranslation(
    @Payload() data: { namespace: string, key: string, locale: string, value: string },
  ) {
    return this.commandBus.execute(new UpdateTranslationCommand(
      data.namespace,
      data.key,
      data.locale,
      data.value,
    ));
  }

  @MessagePattern(I18N_SERVICE_PATTERNS.TRANSLATIONS.DELETE)
  deleteTranslation(
    @Payload() data: { namespace: string, key: string, locale: string },
  ) {
    return this.commandBus.execute(new DeleteTranslationCommand(
      data.namespace,
      data.key,
      data.locale,
    ));
  }
}
