import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TicketPriority, TicketStatus } from '@pkg/database';

import { CreateTicketCommand } from './commands';
import { GetTicketsQuery } from './queries';
import { SUPPORT_SERVICE_PATTERNS } from './support.contract';

@Controller()
export class SupportController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(SUPPORT_SERVICE_PATTERNS.TICKET.LIST)
  async getTickets(@Payload() data: { organizationId?: string, status?: TicketStatus }) {
    return this.queryBus.execute(new GetTicketsQuery(data.organizationId, data.status));
  }

  @MessagePattern(SUPPORT_SERVICE_PATTERNS.TICKET.CREATE)
  async createTicket(@Payload() data: { memberId: string, data: { organizationId: string, title: string, content: string, priority?: TicketPriority } }) {
    return this.commandBus.execute(
      new CreateTicketCommand(
        data.memberId,
        data.data.organizationId,
        data.data.title,
        data.data.content,
        data.data.priority,
      ),
    );
  }
}
