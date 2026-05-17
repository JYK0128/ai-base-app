import { Collection } from '@mikro-orm/core';
import { Entity, Enum, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import type { Manager } from '../manager/manager.entity';
import { ManagerInvite } from '../manager/manager.invite.entity';
import { ManagerTermsConsent } from '../terms/manager.terms.consent.entity';
import { TermsDocument } from '../terms/terms.document.entity';
import { OrganizationRepository } from './organization.repository';

export enum OrganizationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}

@Entity({ schema: 'platform', repository: () => OrganizationRepository })
export class Organization
  extends CoreEntity<Organization, 'status'> {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Enum(() => OrganizationStatus)
  status: OrganizationStatus = OrganizationStatus.ACTIVE;

  @OneToMany({ mappedBy: 'organization' })
  managers = new Collection<Manager>(this);

  @OneToMany(() => ManagerInvite, (invite) => invite.organization)
  managerInvites = new Collection<ManagerInvite>(this);

  @OneToMany(() => TermsDocument, (doc) => doc.organization)
  termsDocuments = new Collection<TermsDocument>(this);

  @OneToMany(() => ManagerTermsConsent, (consent) => consent.organization)
  termsConsents = new Collection<ManagerTermsConsent>(this);

  isActive(): boolean {
    return this.status === OrganizationStatus.ACTIVE;
  }
}
