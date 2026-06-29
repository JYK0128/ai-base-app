import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { I18nLocale } from '@pkg/database';

import { GetLocaleListContract } from './get-locale-list.contract';
import { GetLocaleListResponseDto, LocaleListItem } from './get-locale-list.response.dto';

@QueryHandler(GetLocaleListContract)
export class GetLocaleListHandler implements IQueryHandler<GetLocaleListContract> {
  async execute(): Promise<GetLocaleListResponseDto> {
    this.verifyLocales();
    return this.processList();
  }

  private verifyLocales(): void {
    // locale 목록 조회 정책 검증 영역
  }

  private async processList(): Promise<GetLocaleListResponseDto> {
    const locales = await I18nLocale.find(
      { isActive: true },
      { orderBy: [{ sortOrder: 'ASC' }, { code: 'ASC' }] },
    );

    return new GetLocaleListResponseDto({
      items: locales.map((locale) => new LocaleListItem(locale)),
    });
  }
}
