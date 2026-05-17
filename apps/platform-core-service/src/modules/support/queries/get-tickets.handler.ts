import { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SupportTicket, SupportTicketRepository } from '@pkg/database';

import { GetTicketsAsserter, GetTicketsQuery } from './get-tickets.helpers';

/**
 * 문의 티켓 목록 조회 핸들러
 */
@QueryHandler(GetTicketsQuery)
export class GetTicketsHandler implements IQueryHandler<GetTicketsQuery> {
  private readonly Asserter = GetTicketsAsserter;

  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepo: SupportTicketRepository,
  ) {}

  async execute(query: GetTicketsQuery): Promise<SupportTicket[]> {
    const filter: FilterQuery<SupportTicket> = {};
    if (query.organizationId) filter.organization = { id: query.organizationId };
    if (query.status) filter.status = query.status;

    return this.supportTicketRepo.find(filter, {
      populate: ['author', 'assignedTo', 'organization'],
      orderBy: { createdAt: 'DESC' },
    });
  }
}
