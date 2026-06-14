import { ApiProperty } from '@nestjs/swagger';
import { SupportTicket, TicketPriority, TicketStatus } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class GetTicketResponseDto implements EntityResponseDto<SupportTicket>, Pick<SupportTicket, 'id' | 'title' | 'content' | 'status' | 'priority' | 'createdAt'> {
  constructor(ticket: SupportTicket) {
    this.id = ticket.id;
    this.title = ticket.title;
    this.content = ticket.content;
    this.status = ticket.status;
    this.priority = ticket.priority;
    this.createdAt = ticket.createdAt;
    this.organizationId = ticket.organization.id;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7089', description: '티켓 식별자' })
  id!: string;

  @ApiProperty({ example: '로그인이 안 됩니다', description: '티켓 제목' })
  title!: string;

  @ApiProperty({ example: '로그인 버튼을 클릭하면 아무 반응이 없습니다.', description: '티켓 내용' })
  content!: string;

  @ApiProperty({ enum: TicketStatus, example: 'OPEN', description: '티켓 상태' })
  status!: TicketStatus;

  @ApiProperty({ enum: TicketPriority, example: 'MEDIUM', description: '티켓 우선순위' })
  priority!: TicketPriority;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '생성 일시' })
  createdAt!: Date;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  organizationId!: string;
}
