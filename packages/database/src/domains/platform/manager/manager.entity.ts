import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, OneToMany, Unique } from '@mikro-orm/decorators/legacy';

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

@Entity({ schema: 'platform', repository: () => ManagerRepository })
@Unique({ properties: ['managerAccount', 'organization', 'role'] })
export class Manager extends CoreEntity<Manager> {
  @Index()
  @ManyToOne()
  managerAccount!: Rel<ManagerAccount>;

  @Enum(() => PlatformRole)
  role!: PlatformRole;

  @Index()
  @ManyToOne({ nullable: true })
  organization?: Rel<Organization>;

  @OneToMany(() => ManagerInvite, (invite) => invite.invitedBy)
  sentInvites = new Collection<ManagerInvite>(this);
}
