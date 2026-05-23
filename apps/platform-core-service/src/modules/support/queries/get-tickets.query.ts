import { TicketStatus } from '@pkg/database';

/**
 * 문의 티켓 목록 조회 쿼리
 */
export class GetTicketsQuery {
  constructor(
    public readonly organizationId?: string,
    public readonly status?: TicketStatus,
  ) {}
}
