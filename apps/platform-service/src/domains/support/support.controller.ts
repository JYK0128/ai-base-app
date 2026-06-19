import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { GetTicketPageContract } from './get-ticket-page/get-ticket-page.contract';
import { GetTicketPageRequestDto } from './get-ticket-page/get-ticket-page.request.dto';
import { GetTicketResponseDto } from './get-ticket-page/get-ticket-page.response.dto';

@Controller('support')
export class SupportController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('tickets')
  @SwaggerResponse([GetTicketResponseDto])
  async getTicketPage(
    @Query() query: GetTicketPageRequestDto,
  ): Promise<GetTicketResponseDto[]> {
    return this.queryBus.execute(new GetTicketPageContract(query));
  }
}
