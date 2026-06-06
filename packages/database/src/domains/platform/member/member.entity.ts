import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { OrganizationRoleAssignment } from '../organization/organization.role-assignment.entity';
import { TermsConsent } from '../terms/terms.consent.entity';
import { MemberAccount } from './member.account.entity';
import { MemberRepository } from './member.repository';

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ schema: 'platform', repository: () => MemberRepository })
export class Member extends CoreEntity<Member> {
  @Property({ type: 'string' })
  name!: string;

  @Enum(() => MemberStatus)
  status: Opt<MemberStatus> = MemberStatus.ACTIVE;

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @OneToMany(() => MemberAccount, (account) => account.member)
  accounts = new Collection<MemberAccount>(this);

  @OneToMany(() => OrganizationRoleAssignment, (organizationRole) => organizationRole.member)
  organizationRoles = new Collection<OrganizationRoleAssignment>(this);

  @OneToMany(() => TermsConsent, (consent) => consent.member)
  termsConsents = new Collection<TermsConsent>(this);

  /**
   * 상태 확인 getter
   */
  get isActive(): Opt<boolean> {
    return this.status === MemberStatus.ACTIVE;
  }
}
