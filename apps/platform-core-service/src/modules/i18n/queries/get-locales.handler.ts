import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, I18nLocale } from '@pkg/database';

import { GetLocalesQuery } from './get-locales.query';

export type I18nLocaleRecord = {
  code: string
  name: string
  regionCode?: string
  direction: 'ltr' | 'rtl'
  isActive: boolean
  sortOrder?: number
};

export type I18nLocaleListResult = {
  list: I18nLocaleRecord[]
};

@QueryHandler(GetLocalesQuery)
export class GetLocalesHandler implements IQueryHandler<GetLocalesQuery> {
  constructor(
    @InjectRepository(I18nLocale)
    private readonly localeRepo: CoreRepository<I18nLocale>,
  ) {}

  async execute(): Promise<I18nLocaleListResult> {
    const locales = await this.identifyLocales();
    return this.processLocaleList(locales);
  }

  private async identifyLocales() {
    const locales = await this.localeRepo.find(
      { isActive: true },
      { orderBy: [{ sortOrder: 'ASC' }, { code: 'ASC' }] },
    );

    return locales.map((locale) => ({
      code: locale.code,
      name: locale.name,
      regionCode: locale.regionCode,
      direction: locale.direction,
      isActive: locale.isActive,
      sortOrder: locale.sortOrder,
    }));
  }

  private processLocaleList(locales: I18nLocaleListResult['list']) {
    return {
      list: locales,
    };
  }
}
