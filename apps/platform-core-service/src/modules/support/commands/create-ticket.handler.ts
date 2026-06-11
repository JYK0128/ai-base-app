import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount, Organization, SupportTicket, TicketStatus } from '@pkg/database';

import { CreateTicketCommand } from './create-ticket.command';
import { CreateTicketAsserter } from './create-ticket.error';

/**
 * 문의 티켓 생성 핸들러
 */
@CommandHandler(CreateTicketCommand)
export class CreateTicketHandler implements ICommandHandler<CreateTicketCommand> {
  private readonly Asserter = CreateTicketAsserter;

  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepo: CoreRepository<SupportTicket>,
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepo: CoreRepository<MemberAccount>,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateTicketCommand): Promise<SupportTicket> {
    return this.processCreation(command);
  }

  /**
   * STEP 1: 문의 티켓 생성
   */
  private async processCreation(command: CreateTicketCommand): Promise<SupportTicket> {
    const authorAccount = await this.memberAccountRepo.findOne(
      { id: command.memberId },
      { populate: ['member'] },
    );

    const author = await this.Asserter.assert(
      authorAccount && authorAccount.member ? authorAccount.member : null,
      'AUTHOR_NOT_FOUND',
    );
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
