import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Manager, Organization, SupportTicket, SupportTicketRepository, TicketStatus } from '@pkg/database';

import { CreateTicketAsserter, CreateTicketCommand } from './create-ticket.helpers';

/**
 * 문의 티켓 생성 핸들러
 */
@CommandHandler(CreateTicketCommand)
export class CreateTicketHandler implements ICommandHandler<CreateTicketCommand> {
  private readonly Asserter = CreateTicketAsserter;

  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepo: SupportTicketRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateTicketCommand): Promise<SupportTicket> {
    return this.processCreation(command);
  }

  /**
   * STEP 1: 문의 티켓 생성
   */
  private processCreation(command: CreateTicketCommand): SupportTicket {
    const author = this.em.getReference(Manager, command.authorId);
    const organization = this.em.getReference(Organization, command.organizationId);

    const ticket = this.supportTicketRepo.create({
      title: command.title,
      content: command.content,
      priority: command.priority,
      status: TicketStatus.OPEN,
      author,
      organization,
    });

    this.em.persist(ticket);
    return ticket;
  }
}
