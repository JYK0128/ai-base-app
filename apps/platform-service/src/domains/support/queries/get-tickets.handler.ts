import { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, SupportTicket } from '@pkg/database';

import { GetTicketsContract } from './get-tickets.contract';
import { GetTicketsAsserter } from './get-tickets.error';
import { TicketResponseDto } from './get-tickets.response.dto';

@QueryHandler(GetTicketsContract)
export class GetTicketsHandler implements IQueryHandler<GetTicketsContract> {
  private readonly Asserter = GetTicketsAsserter;

  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepository: CoreRepository<SupportTicket>,
  ) {}

  async execute(query: GetTicketsContract): Promise<TicketResponseDto[]> {
    const filter: FilterQuery<SupportTicket> = {};
    if (query.data.organizationId) filter.organization = { id: query.data.organizationId };
    if (query.data.status) filter.status = query.data.status;

    const tickets = await this.Asserter.assert(
      this.supportTicketRepository.find(filter, {
        populate: ['organization'],
        orderBy: { createdAt: 'DESC' },
      }),
      'LOAD_FAILED',
    );

    return tickets.map((ticket) => new TicketResponseDto(ticket));
  }
}
