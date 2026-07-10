import { EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { OrganizationRoleAssignment } from '../organization/organization-role-assignment.entity';
import { TermsConsent } from '../terms/terms-consent.entity';
import { MemberStatus } from './member.constants';
import { isMemberActive } from './member.policy-status';
import { MemberAccount } from './member-account.entity';

@Entity({ schema: 'platform' })
export class Member extends CoreEntity<Member> {
  [EntityName]?: 'Member';

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @OneToMany(() => MemberAccount, (account) => account.member)
  accounts = new Collection<MemberAccount>(this);

  @OneToMany(() => OrganizationRoleAssignment, (organizationRole) => organizationRole.member)
  roles = new Collection<OrganizationRoleAssignment>(this);

  @OneToMany(() => TermsConsent, (consent) => consent.member)
  consents = new Collection<TermsConsent>(this);

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  email!: string;

  @Property({ type: 'string', nullable: true })
  phone?: string;

  @Enum(() => MemberStatus)
  status: Opt<MemberStatus> = MemberStatus.ACTIVE;

  /**
   * 상태 확인 getter
   */
  @Property({ persist: false })
  get isActive(): Opt<boolean> {
    return isMemberActive(this.status);
  }
}
