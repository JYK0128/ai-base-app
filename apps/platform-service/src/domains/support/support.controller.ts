import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetTicketsContract } from './queries/get-tickets.contract';
import { GetTicketsRequestDto } from './queries/get-tickets.request.dto';
import { GetTicketResponseDto } from './queries/get-tickets.response.dto';

@Controller('support')
export class SupportController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('tickets')
  async getTickets(
    @Query() query: GetTicketsRequestDto,
  ): Promise<GetTicketResponseDto[]> {
    return this.queryBus.execute(new GetTicketsContract(query));
  }
}
