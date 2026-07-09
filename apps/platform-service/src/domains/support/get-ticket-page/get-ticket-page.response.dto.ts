import { ApiProperty } from '@nestjs/swagger';
import { SupportTicket, TicketPriority, TicketStatus } from '@pkg/database';

import { EntityResponseType, PageResponseDto } from '@/common/interfaces';
export class GetTicketPageItem extends EntityResponseType(SupportTicket) {
  constructor(ticket: SupportTicket) {
    super();
    this.id = ticket.id;
    this.title = ticket.title;
    this.content = ticket.content;
    this.status = ticket.status;
    this.priority = ticket.priority;
    this.createdAt = ticket.createdAt;
    this.organizationId = ticket.organization.id;
  }

  @ApiProperty({ type: String, description: '티켓 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '티켓 제목' })
  override title!: string;

  @ApiProperty({ type: String, description: '티켓 내용' })
  override content!: string;

  @ApiProperty({ enum: TicketStatus, description: '티켓 상태' })
  override status!: TicketStatus;

  @ApiProperty({ enum: TicketPriority, description: '티켓 우선순위' })
  override priority!: TicketPriority;

  @ApiProperty({ type: String, description: '생성 일시' })
  override createdAt!: Date;

  @ApiProperty({ type: String, description: '조직 식별자' })
  organizationId!: string;
}
export class GetTicketPageResponseDto extends PageResponseDto<GetTicketPageItem> {
  constructor(args: PageResponseDto<GetTicketPageItem>) {
    super();
    this.items = args.items;
    this.totalCount = args.totalCount;
    this.page = args.page;
    this.totalPages = args.totalPages;
    this.hasNextPage = args.hasNextPage;
    this.hasPrevPage = args.hasPrevPage;
  }

  @ApiProperty({ type: () => [GetTicketPageItem], description: '티켓 목록' })
  items!: GetTicketPageItem[];
}
