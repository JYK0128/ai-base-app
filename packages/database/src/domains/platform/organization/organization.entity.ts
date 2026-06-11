import { Collection, EntityName, type Opt } from '@mikro-orm/core';
import { Entity, Enum, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Member } from '../member/member.entity';
import { MemberInvite } from '../member/member.invite.entity';
import { TermsDocument } from '../terms/terms.document.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationRole } from './organization.role.entity';

export enum OrganizationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}

@Entity({ schema: 'platform', repository: () => OrganizationRepository })
export class Organization extends CoreEntity<Organization> {
  [EntityName]?: 'Organization';

  @Property({ type: 'string', unique: true })
  code!: string;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', unique: true })
  email!: string;

  @Enum(() => OrganizationStatus)
  status: Opt<OrganizationStatus> = OrganizationStatus.ACTIVE;

  @OneToMany(() => Member, (member) => member.organization)
  members = new Collection<Member>(this);

  @OneToMany(() => MemberInvite, (invite) => invite.organization)
  memberInvites = new Collection<MemberInvite>(this);

  @OneToMany(() => OrganizationRole, (role) => role.organization)
  organizationRoles = new Collection<OrganizationRole>(this);

  @OneToMany(() => TermsDocument, (doc) => doc.organization)
  termsDocuments = new Collection<TermsDocument>(this);

  @Property({ persist: false })
  get isActive(): Opt<boolean> {
    return this.status === OrganizationStatus.ACTIVE;
  }
}
