import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import type { Organization } from '@/domains/organization/organization.entity';
import type { Role } from '@/domains/rbac/rbac.entity';

@Entity({ schema: 'platform' })
@Unique({ properties: ['managerId', 'role', 'organization'] })
export class ManagerRole extends BaseEntity {
  @Index()
  @Property()
  managerId!: string;

  @Index()
  @ManyToOne()
  role!: Rel<Role>;

  @Index()
  @ManyToOne({ nullable: true })
  organization?: Rel<Organization>;
}
