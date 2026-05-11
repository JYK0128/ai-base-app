import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Manager,
         Organization,
         SupportTicket,
         SupportTicketRepository,
         TicketStatus } from '@pkg/database';

export { CreateTicketCommand } from './create-ticket.helpers';
import { CreateTicketCommand } from './create-ticket.helpers';

@CommandHandler(CreateTicketCommand)
export class CreateTicketHandler implements ICommandHandler<CreateTicketCommand> {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepo: SupportTicketRepository,
  ) {}

  @Transactional()
  async execute(command: CreateTicketCommand): Promise<SupportTicket> {
    const em = this.supportTicketRepo.getEntityManager();
    const author = em.getReference(Manager, command.authorId);
    const organization = em.getReference(Organization, command.organizationId);

    const ticket = this.supportTicketRepo.create({
      title: command.title,
      content: command.content,
      priority: command.priority,
      status: TicketStatus.OPEN,
      author,
      organization,
    });

    em.persist(ticket);
    return ticket;
  }
}
