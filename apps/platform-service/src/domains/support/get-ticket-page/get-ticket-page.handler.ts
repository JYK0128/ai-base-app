import { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, SupportTicket } from '@pkg/database';

import { GetTicketPageContract } from './get-ticket-page.contract';
import { GetTicketPageAsserter } from './get-ticket-page.error';
import { GetTicketResponseDto } from './get-ticket-page.response.dto';

@QueryHandler(GetTicketPageContract)
export class GetTicketPageHandler implements IQueryHandler<GetTicketPageContract> {
  private readonly Asserter = GetTicketPageAsserter;

  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepository: CoreRepository<SupportTicket>,
  ) {}

  async execute(query: GetTicketPageContract): Promise<GetTicketResponseDto[]> {
    const filters = query.data.filters;
    const filter: FilterQuery<SupportTicket> = {};
    if (filters?.organization) filter.organization = { id: filters.organization };
    if (filters?.status) filter.status = filters.status;

    const tickets = await this.Asserter.assert(
      this.supportTicketRepository.find(filter, {
        populate: ['organization'],
        orderBy: { createdAt: 'DESC' },
      }),
      'LOAD_FAILED',
    );

    return tickets.map((ticket) => new GetTicketResponseDto(ticket));
  }
}
