import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Manager } from '../manager/manager.entity';
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
  @Property()
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Enum(() => TicketStatus)
  status: Opt<TicketStatus> = TicketStatus.OPEN;

  @Enum(() => TicketPriority)
  priority: Opt<TicketPriority> = TicketPriority.MEDIUM;

  @ManyToOne(() => Manager)
  author!: Rel<Manager>;

  @ManyToOne(() => Manager, { nullable: true })
  assignedTo?: Rel<Manager>;

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;
}
