import { TicketPriority } from '@pkg/database';

export class CreateTicketCommand {
  constructor(
    public readonly authorId: string,
    public readonly organizationId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly priority?: TicketPriority,
  ) {}
}
