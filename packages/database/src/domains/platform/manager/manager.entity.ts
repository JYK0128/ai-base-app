import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, OneToMany } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import type { Organization } from '../organization/organization.entity';
import { ManagerRole } from '../rbac/manager.role.entity';
import { ManagerTermsConsent } from '../terms/manager.terms.consent.entity';
import { ManagerAccount } from './manager.account.entity';
import { ManagerInvite } from './manager.invite.entity';
import { ManagerRepository } from './manager.repository';

export enum ManagerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ schema: 'platform', repository: () => ManagerRepository })
export class Manager extends CoreEntity<Manager> {
  @Enum(() => ManagerStatus)
  status: ManagerStatus = ManagerStatus.ACTIVE;

  @Index()
  @ManyToOne({ nullable: true })
  organization?: Rel<Organization> | null;

  @OneToMany(() => ManagerAccount, (account) => account.manager)
  accounts = new Collection<ManagerAccount>(this);

  @OneToMany(() => ManagerInvite, (invite) => invite.invitedBy)
  invites = new Collection<ManagerInvite>(this);

  @OneToMany(() => ManagerRole, (managerRole) => managerRole.manager)
  roles = new Collection<ManagerRole>(this);

  @OneToMany(() => ManagerTermsConsent, (consent) => consent.manager)
  termsConsents = new Collection<ManagerTermsConsent>(this);
}
