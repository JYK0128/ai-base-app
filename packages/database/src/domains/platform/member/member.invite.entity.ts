import { EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'crypto';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { OrganizationRole } from '../organization/organization.role.entity';
import { MemberInviteRepository } from './member.invite.repository';

export enum MemberInviteStatus {
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export const MAIL_DELIVERY_TIMEOUT_MS = 15 * 60 * 1000;

@Embeddable()
export class MemberInviteMailDeliveryMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<MemberInviteMailDeliveryMetadata>) {
    Object.assign(this, data);
  }

  @Property({ type: 'string' })
  attemptId: Opt<string> = randomUUID();

  @Property({ type: Date })
  queuedAt: Opt<Date> = new Date();

  @Property({ type: Date, nullable: true })
  sentAt?: Date | null;

  @Property({ type: Date, nullable: true })
  failedAt?: Date | null;
}

@Embeddable()
export class MemberInviteInfoMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<MemberInviteInfoMetadata>) {
    Object.assign(this, data);
  }

  @Property({ type: 'string', nullable: true })
  note?: string;
}

@Embeddable()
export class MemberInviteTimelineMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<MemberInviteTimelineMetadata>) {
    Object.assign(this, data);
  }

  @Property({ type: Date, nullable: true })
  resentAt?: Date | null;

  @Property({ type: Date, nullable: true })
  cancelAt?: Date | null;

  @Property({ type: Date, nullable: true })
  revivedAt?: Date | null;
}

@Embeddable()
export class MemberInviteMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<MemberInviteMetadata>) {
    Object.assign(this, data);
  }

  @Embedded({ entity: () => MemberInviteInfoMetadata, object: true })
  info: MemberInviteInfoMetadata = new MemberInviteInfoMetadata();

  @Embedded({ entity: () => MemberInviteTimelineMetadata, object: true })
  timeline: MemberInviteTimelineMetadata = new MemberInviteTimelineMetadata();

  @Embedded({ entity: () => MemberInviteMailDeliveryMetadata, object: true })
  mailDelivery: MemberInviteMailDeliveryMetadata = new MemberInviteMailDeliveryMetadata();
}

@Entity({ schema: 'platform', repository: () => MemberInviteRepository })
export class MemberInvite extends CoreEntity<MemberInvite> {
  [EntityName]?: 'MemberInvite';

  @Property({ type: 'string' })
  name!: string;

  @ManyToOne()
  role!: Rel<OrganizationRole>;

  @ManyToOne()
  organization!: Rel<Organization>;

  @Property({ type: 'string' })
  token!: string;

  @Property({ type: 'string' })
  email!: string;

  @Property({ type: Date })
  expiresAt!: Date;

  @Enum(() => MemberInviteStatus)
  status: Opt<MemberInviteStatus> = MemberInviteStatus.PENDING;

  @Embedded({ entity: () => MemberInviteMetadata, object: true })
  override metadata: Opt<MemberInviteMetadata> = new MemberInviteMetadata();

  @Property({ persist: false })
  get isPending(): Opt<boolean> {
    return this.status === MemberInviteStatus.PENDING;
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

  @Property({ persist: false })
  get isMailDeliveryQueued(): Opt<boolean> {
    const delivery = this.metadata.mailDelivery;

    if (!delivery) {
      return false;
    }

    return !delivery.sentAt && !delivery.failedAt && !this.isMailDeliveryTimeout;
  }

  @Property({ persist: false })
  get isMailDeliveryTimeout(): Opt<boolean> {
    const delivery = this.metadata.mailDelivery;

    if (!delivery || delivery.sentAt || delivery.failedAt) {
      return false;
    }

    const queuedAtTime = delivery.queuedAt.getTime();
    return Number.isFinite(queuedAtTime) && queuedAtTime + MAIL_DELIVERY_TIMEOUT_MS <= Date.now();
  }

  @Property({ persist: false })
  get isMailDeliveryFailed(): Opt<boolean> {
    const delivery = this.metadata.mailDelivery;

    if (!delivery) {
      return false;
    }

    return !!delivery.failedAt || this.isMailDeliveryTimeout;
  }
}
