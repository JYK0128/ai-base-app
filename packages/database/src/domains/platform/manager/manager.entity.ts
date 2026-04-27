import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, OneToMany, OneToOne, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import type { Organization } from '../organization/organization.entity';
import { ManagerAccount } from './manager.account.entity';
import { ManagerInvite } from './manager.invite.entity';
import { ManagerRepository } from './manager.repository';

export enum PlatformRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_STAFF = 'PLATFORM_STAFF',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN',
  ORGANIZATION_STAFF = 'ORGANIZATION_STAFF',
}

export enum ManagerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ schema: 'platform', repository: () => ManagerRepository })
export class Manager extends CoreEntity<Manager> {
  @Enum(() => PlatformRole)
  role!: PlatformRole;

  @Enum(() => ManagerStatus)
  status: ManagerStatus = ManagerStatus.ACTIVE;

  @Index()
  @ManyToOne({ nullable: true })
  organization?: Rel<Organization> | null;

  @OneToMany(() => ManagerAccount, (account) => account.manager)
  accounts = new Collection<ManagerAccount>(this);

  @OneToMany(() => ManagerInvite, (invite) => invite.invitedBy)
  sentInvites = new Collection<ManagerInvite>(this);
}
