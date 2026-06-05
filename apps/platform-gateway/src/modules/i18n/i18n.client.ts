import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { type TranslationBulkDto, type TranslationCreateDto, type TranslationDeleteDto, type TranslationsQueryDto, type TranslationUpdateDto } from './dto/i18n-request.dto';
import type { LocalesDataDto, TranslationBulkDataDto, TranslationCreateDataDto, TranslationDataDto, TranslationDeleteDataDto, TranslationListDataDto, TranslationUpdateDataDto } from './dto/i18n-response.dto';
import { I18N_SERVICE, I18N_SERVICE_PATTERNS } from './i18n.constants';
import { parseKeys } from './i18n.helpers';

@Injectable()
export class I18nClient extends CoreClient {
  constructor(
    @Inject(I18N_SERVICE) client: ClientProxy,
    cls: ClsService,
  ) {
    super(client, cls);
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
