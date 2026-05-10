import type { Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import type { ManagerAccount } from './manager.account.entity';
import { ManagerAccountVerificationRepository } from './manager.account.verification.repository';

export enum ManagerAccountVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
}

@Entity({ schema: 'platform', repository: () => ManagerAccountVerificationRepository })
@Unique({ properties: ['tokenHash'] })
export class ManagerAccountVerification extends CoreEntity<ManagerAccountVerification> {
  @Property()
  tokenHash!: string;

  @Index()
  @ManyToOne()
  managerAccount!: Rel<ManagerAccount>;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  verifiedAt?: Date | null;

  @Enum(() => ManagerAccountVerificationStatus)
  status: ManagerAccountVerificationStatus = ManagerAccountVerificationStatus.PENDING;
}
