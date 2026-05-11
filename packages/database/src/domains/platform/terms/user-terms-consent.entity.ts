import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { User } from '../../site/user.entity';
import { Organization } from '../organization/organization.entity';
import { TermsVersion } from './terms-version.entity';
import { UserTermsConsentRepository } from './user-terms-consent.repository';

@Entity({ schema: 'platform', repository: () => UserTermsConsentRepository })
@Unique({ properties: ['user', 'organization', 'termsVersion'] })
export class UserTermsConsent extends CoreEntity<UserTermsConsent> {
  @Index()
  @ManyToOne(() => User)
  user!: Rel<User>;

  @Index()
  @ManyToOne(() => Organization, { nullable: true })
  organization?: Rel<Organization>;

  @Index()
  @ManyToOne(() => TermsVersion)
  termsVersion!: Rel<TermsVersion>;

  @Property({ default: true })
  agreed: boolean = true;

  @Property()
  agreedAt: Date = new Date();

  @Property({ nullable: true })
  source?: string | null = null;

  @Property({ nullable: true })
  ipAddress?: string | null = null;

  @Property({ type: 'text', nullable: true })
  userAgent?: string | null = null;
}
