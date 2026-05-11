import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TicketPriority, TicketStatus } from '@pkg/database';

import { CreateTicketCommand } from './commands/create-ticket.handler';
import { GetTicketsQuery } from './queries/get-tickets.handler';

@Controller()
export class SupportController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern('support.tickets.get')
  async getTickets(@Payload() data: { organizationId?: string, status?: TicketStatus }) {
    return this.queryBus.execute(new GetTicketsQuery(data.organizationId, data.status));
  }

  @MessagePattern('support.tickets.create')
  async createTicket(@Payload() data: { authorId: string, data: { organizationId: string, title: string, content: string, priority?: TicketPriority } }) {
    return this.commandBus.execute(
      new CreateTicketCommand(
        data.authorId,
        data.data.organizationId,
        data.data.title,
        data.data.content,
        data.data.priority,
      ),
    );
  }
}
