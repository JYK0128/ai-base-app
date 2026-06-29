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
    this.organization = ticket.organization.id;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7089', description: '티켓 식별자' })
  override id!: string;

  @ApiProperty({ example: '로그인이 안 됩니다', description: '티켓 제목' })
  override title!: string;

  @ApiProperty({ example: '로그인 버튼을 클릭하면 아무 반응이 없습니다.', description: '티켓 내용' })
  override content!: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.OPEN, description: '티켓 상태' })
  override status!: TicketStatus;

  @ApiProperty({ enum: TicketPriority, example: TicketPriority.MEDIUM, description: '티켓 우선순위' })
  override priority!: TicketPriority;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '생성 일시' })
  override createdAt!: Date;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  override organization!: string;
}

export class GetTicketPageResponseDto extends PageResponseDto<GetTicketPageItem> {
  constructor(args: PageResponseDto<GetTicketPageItem>) {
    super();
    this.items = args.items;
    this.totalCount = args.totalCount;
    this.page = args.page;
    this.limit = args.limit;
    this.totalPages = args.totalPages;
    this.hasNextPage = args.hasNextPage;
    this.hasPrevPage = args.hasPrevPage;
  }

  @ApiProperty({
    type: [GetTicketPageItem],
    example: [],
    description: '티켓 목록',
  })
  items!: GetTicketPageItem[];
}
