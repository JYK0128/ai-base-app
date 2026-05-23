import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';

import { type TranslationBulkDto,
         type TranslationCreateDto,
         type TranslationDeleteDto,
         type TranslationsQueryDto,
         type TranslationUpdateDto } from './dto/i18n-request.dto';
import type { LocalesDataDto,
              TranslationBulkDataDto,
              TranslationCreateDataDto,
              TranslationDataDto,
              TranslationDeleteDataDto,
              TranslationListDataDto,
              TranslationUpdateDataDto } from './dto/i18n-response.dto';
import { I18N_SERVICE, I18N_SERVICE_PATTERNS } from './i18n.constants';
import { parseKeys } from './i18n.helpers';

@Injectable()
export class I18nClient {
  constructor(
    @Inject(I18N_SERVICE)
    private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  private async send<TResult = unknown, TInput extends object = object>(pattern: string, data: TInput): Promise<TResult> {
    const payload = {
      ...data,
      traceId: this.cls.get('traceId'),
      sid: this.cls.get('sid'),
      clientIp: this.cls.get('clientIp'),
      userId: this.cls.get('userId'),
      organizationId: this.cls.get('organizationId'),
      acceptLanguage: this.cls.get('acceptLanguage'),
    };

    return firstValueFrom(
      this.client.send<TResult>(pattern, payload).pipe(
        defaultIfEmpty(undefined as TResult),
      ),
    );
  }

  async getLocales(): Promise<LocalesDataDto> {
    return this.send(I18N_SERVICE_PATTERNS.LOCALES.GET, {});
  }

  async getTranslation(params: { namespace: string, key: string, locale?: string }): Promise<TranslationDataDto> {
    return this.send(
      I18N_SERVICE_PATTERNS.TRANSLATIONS.GET_ONE,
      params,
    );
  }

  async getTranslations(query: TranslationsQueryDto): Promise<TranslationListDataDto> {
    return this.send(
      I18N_SERVICE_PATTERNS.TRANSLATIONS.GET_MANY,
      {
        namespace: query.namespace,
        keys: query.keys ? parseKeys(query.keys) : undefined,
        locale: query.locale,
      },
    );
  }

  async bulkTranslations(dto: TranslationBulkDto): Promise<TranslationBulkDataDto> {
    return this.send(
      I18N_SERVICE_PATTERNS.TRANSLATIONS.BULK,
      dto,
    );
  }

  async createTranslation(dto: TranslationCreateDto): Promise<TranslationCreateDataDto> {
    return this.send(
      I18N_SERVICE_PATTERNS.TRANSLATIONS.CREATE,
      dto,
    );
  }

  async updateTranslation(dto: TranslationUpdateDto): Promise<TranslationUpdateDataDto> {
    return this.send(
      I18N_SERVICE_PATTERNS.TRANSLATIONS.UPDATE,
      dto,
    );
  }

  async deleteTranslation(dto: TranslationDeleteDto): Promise<TranslationDeleteDataDto> {
    return this.send(
      I18N_SERVICE_PATTERNS.TRANSLATIONS.DELETE,
      dto,
    );
  }

  private identifyLocale(locale?: string): string {
    return locale ?? this.cls.get('acceptLanguage');
  }
}
