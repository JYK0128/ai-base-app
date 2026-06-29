import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { GetLocaleListContract } from './locale-list/get-locale-list.contract';
import { GetLocaleListResponseDto } from './locale-list/get-locale-list.response.dto';

@Controller('i18n')
export class I18nController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('locales')
  @SwaggerResponse(GetLocaleListResponseDto)
  async getLocaleList(): Promise<GetLocaleListResponseDto> {
    return this.queryBus.execute(new GetLocaleListContract());
  }
}
