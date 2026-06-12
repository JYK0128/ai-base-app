import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetLocalesContract } from './locales/get-locales.contract';
import type { GetLocalesResponseDto } from './locales/get-locales.response.dto';

@Controller('i18n')
export class I18nController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('locales')
  async getLocales(): Promise<GetLocalesResponseDto> {
    return this.queryBus.execute(new GetLocalesContract());
  }
}
