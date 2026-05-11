import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Manager } from '../manager/manager.entity';
import { Organization } from '../organization/organization.entity';
import { ManagerTermsConsentRepository } from './manager.terms.consent.repository';
import { TermsVersion } from './terms.version.entity';

@Entity({ schema: 'platform', repository: () => ManagerTermsConsentRepository })
export class ManagerTermsConsent extends CoreEntity<ManagerTermsConsent> {
  @ManyToOne(() => Manager)
  manager!: Rel<Manager>;

  @ManyToOne(() => Organization, { nullable: true })
  organization?: Rel<Organization>;

  @ManyToOne(() => TermsVersion)
  termsVersion!: Rel<TermsVersion>;

  @Property()
  agreed!: boolean;

  @Property({ nullable: true })
  ipAddress?: string | null = null;

  @Property({ type: 'text', nullable: true })
  userAgent?: string | null = null;
}
