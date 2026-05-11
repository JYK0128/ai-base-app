import { TicketStatus } from '@pkg/database';

export class GetTicketsQuery {
  constructor(
    public readonly organizationId?: string,
    public readonly status?: TicketStatus,
  ) {}
}
