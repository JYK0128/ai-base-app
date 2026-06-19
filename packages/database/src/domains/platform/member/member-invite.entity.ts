import { EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'crypto';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { OrganizationRole } from '../organization/organization-role.entity';
import { MemberInviteStatus } from './member.constants';
import { getMemberInviteStatus } from './member-invite.policy-status';

@Embeddable()
export class MemberInviteMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<MemberInviteMetadata>) {
    Object.assign(this, data);
  }

  @Property({ type: 'string', nullable: true })
  note?: string;

  @Property({ type: 'string' })
  attemptId: Opt<string> = randomUUID();

  @Property({ type: Date })
  queuedAt: Opt<Date> = new Date();

  @Property({ type: Date, nullable: true })
  sentAt?: Date | null;

  @Property({ type: Date, nullable: true })
  failedAt?: Date | null;

  @Property({ type: Date, nullable: true })
  cancelAt?: Date | null;

  @Property({ type: Date, nullable: true })
  acceptedAt?: Date | null;

  @Property({ type: Date, nullable: true })
  rejectedAt?: Date | null;

  @Property({ type: Date, nullable: true })
  expiredAt?: Date | null;
}

@Entity({ schema: 'platform' })
export class MemberInvite extends CoreEntity<MemberInvite> {
  [EntityName]?: 'MemberInvite';

  @ManyToOne(() => OrganizationRole)
  role!: Rel<OrganizationRole>;

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  token!: string;

  @Property({ type: 'string' })
  email!: string;

  @Property({ persist: false })
  get note(): string | undefined {
    return this.metadata?.note;
  }

  @Property({ persist: false })
  get status(): Opt<MemberInviteStatus> {
    return getMemberInviteStatus(this.metadata);
  }

  @Property({ persist: false })
  get isQueued(): Opt<boolean> {
    return this.status === MemberInviteStatus.QUEUED;
  }

  @Property({ persist: false })
  get isPending(): Opt<boolean> {
    return this.status === MemberInviteStatus.PENDING;
  }

  @Property({ persist: false })
  get isExpired(): Opt<boolean> {
    return this.status === MemberInviteStatus.EXPIRED;
  }

  @Property({ persist: false })
  get isCanceled(): Opt<boolean> {
    return this.status === MemberInviteStatus.CANCELED;
  }

  @Property({ persist: false })
  get isAccepted(): Opt<boolean> {
    return this.status === MemberInviteStatus.ACCEPTED;
  }

  @Property({ persist: false })
  get isRejected(): Opt<boolean> {
    return this.status === MemberInviteStatus.REJECTED;
  }

  @Embedded({ entity: () => MemberInviteMetadata, object: true })
  override metadata: Opt<MemberInviteMetadata> = new MemberInviteMetadata();
}
