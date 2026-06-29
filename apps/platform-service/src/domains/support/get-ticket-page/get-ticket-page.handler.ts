import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SupportTicket } from '@pkg/database';

import { GetTicketPageContract } from './get-ticket-page.contract';
import { GetTicketPageAsserter } from './get-ticket-page.error';
import { GetTicketPageItem, GetTicketPageResponseDto } from './get-ticket-page.response.dto';

@QueryHandler(GetTicketPageContract)
export class GetTicketPageHandler implements IQueryHandler<GetTicketPageContract> {
  private readonly Asserter = GetTicketPageAsserter;

  async execute(query: GetTicketPageContract): Promise<GetTicketPageResponseDto> {
    this.verifyTicketPage(query);
    return this.processPage(query);
  }

  private verifyTicketPage(_query: GetTicketPageContract): void {
    // 티켓 목록 조회 정책 검증 영역
  }

  private async processPage(query: GetTicketPageContract): Promise<GetTicketPageResponseDto> {
    const ticketsPage = await this.Asserter.assert(
      SupportTicket.findByPage(query.data.toFilterQuery(), {
        populate: ['organization'],
        ...query.data.toPageOptions(),
      }),
      'LOAD_FAILED',
    );

    return new GetTicketPageResponseDto({
      ...ticketsPage,
      items: ticketsPage.items.map((ticket) => new GetTicketPageItem(ticket)),
    });
  }
}
