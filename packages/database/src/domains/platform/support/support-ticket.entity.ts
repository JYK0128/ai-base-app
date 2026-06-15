import { EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Member } from '../member/member.entity';
import { Organization } from '../organization/organization.entity';
import { TicketPriority, TicketStatus } from './support.constants';

@Entity({ schema: 'platform' })
export class SupportTicket extends CoreEntity<SupportTicket> {
  [EntityName]?: 'SupportTicket';

  @ManyToOne(() => Member)
  author!: Rel<Member>;

  @ManyToOne(() => Member, { nullable: true })
  assignedTo?: Rel<Member>;

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Enum(() => TicketStatus)
  status: Opt<TicketStatus> = TicketStatus.OPEN;

  @Enum(() => TicketPriority)
  priority: Opt<TicketPriority> = TicketPriority.MEDIUM;
}
