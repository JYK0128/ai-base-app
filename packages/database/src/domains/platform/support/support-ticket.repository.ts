import { EntityRepository } from '@mikro-orm/postgresql';

import { SupportTicket } from './support-ticket.entity';

export class SupportTicketRepository extends EntityRepository<SupportTicket> {}
