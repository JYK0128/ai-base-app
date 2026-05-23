import { TicketPriority } from '@pkg/database';

/**
 * 문의 티켓 생성 커맨드
 */
export class CreateTicketCommand {
  constructor(
    public readonly authorId: string,
    public readonly organizationId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly priority?: TicketPriority,
  ) {}
}
