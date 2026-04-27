import type { Opt } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Site } from '../../site/site.entity';
import type { Manager } from '../manager/manager.entity';
import { ManagerInvite } from '../manager/manager.invite.entity';
import { OrganizationRepository } from './organization.repository';

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ schema: 'platform', repository: () => OrganizationRepository })
export class Organization extends CoreEntity<Organization> {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Enum(() => OrganizationStatus)
  status: OrganizationStatus & Opt = OrganizationStatus.ACTIVE;

  @OneToMany({ mappedBy: 'organization' })
  managers = new Collection<Manager>(this);

  @OneToMany(() => ManagerInvite, (invite) => invite.organization)
  managerInvites = new Collection<ManagerInvite>(this);

  @OneToMany(() => Site, (site) => site.organization)
  sites = new Collection<Site>(this);
}
