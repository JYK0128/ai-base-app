import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, I18nLocale } from '@pkg/database';

import { GetLocalesContract } from './get-locales.contract';
import { GetLocaleResponseDto, GetLocalesResponseDto } from './get-locales.response.dto';

@QueryHandler(GetLocalesContract)
export class GetLocalesHandler implements IQueryHandler<GetLocalesContract> {
  constructor(
    @InjectRepository(I18nLocale)
    private readonly localeRepository: CoreRepository<I18nLocale>,
  ) {}

  async execute(): Promise<GetLocalesResponseDto> {
    const locales = await this.localeRepository.find(
      { isActive: true },
      { orderBy: [{ sortOrder: 'ASC' }, { code: 'ASC' }] },
    );

    return new GetLocalesResponseDto(locales.map((locale) => new GetLocaleResponseDto(locale)));
  }
}
