import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import type { Organization } from '../organization/organization.entity';
import type { OrganizationRole } from '../organization/organization.role.entity';
import type { Member } from './member.entity';
import { MemberInviteRepository } from './member.invite.repository';

export enum MemberInviteStatus {
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity({ schema: 'platform', repository: () => MemberInviteRepository })
export class MemberInvite
  extends CoreEntity<MemberInvite, 'status'> {
  @Property()
  name!: string;

  @ManyToOne()
  role!: Rel<OrganizationRole>;

  @ManyToOne()
  organization!: Rel<Organization>;

  @Property()
  token!: string;

  @Property()
  email!: string;

  @ManyToOne()
  invitedBy!: Rel<Member>;

  @Property({ nullable: true })
  invitedAt?: Date;

  @Property()
  expiresAt!: Date;

  @Enum(() => MemberInviteStatus)
  status: MemberInviteStatus = MemberInviteStatus.PENDING;

  get isPending(): Opt<boolean> {
    return this.status === MemberInviteStatus.PENDING;
  }

  get isCanceled(): Opt<boolean> {
    return this.status === MemberInviteStatus.CANCELED;
  }

  get isAccepted(): Opt<boolean> {
    return this.status === MemberInviteStatus.ACCEPTED;
  }

  get isRejected(): Opt<boolean> {
    return this.status === MemberInviteStatus.REJECTED;
  }
}
