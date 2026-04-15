import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, OneToMany, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import type { Organization } from '@/domains/organization/organization.entity';
import { ManagerAccount } from '@/domains/platform/platform.account.entity';
import { ManagerInvite } from '@/domains/platform/platform.invite.entity';

export enum PlatformRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_STAFF = 'PLATFORM_STAFF',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN',
  ORGANIZATION_STAFF = 'ORGANIZATION_STAFF',
}

@Entity({ schema: 'platform' })
@Unique({ properties: ['managerAccount', 'organization', 'role'] })
export class Manager extends BaseEntity {
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
