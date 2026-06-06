import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Member } from '../member/member.entity';
import { Organization } from '../organization/organization.entity';
import { SupportTicketRepository } from './support-ticket.repository';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity({ schema: 'platform', repository: () => SupportTicketRepository })
export class SupportTicket extends CoreEntity<SupportTicket> {
  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Enum(() => TicketStatus)
  status: Opt<TicketStatus> = TicketStatus.OPEN;

  @Enum(() => TicketPriority)
  priority: Opt<TicketPriority> = TicketPriority.MEDIUM;

  @ManyToOne(() => Member)
  author!: Rel<Member>;

  @ManyToOne(() => Member, { nullable: true })
  assignedTo?: Rel<Member>;

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;
}
