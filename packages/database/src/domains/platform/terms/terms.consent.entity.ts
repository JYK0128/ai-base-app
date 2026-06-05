import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Member } from '../member/member.entity';
import { TermsConsentRepository } from './terms.consent.repository';
import { TermsVersion } from './terms.version.entity';

@Entity({ schema: 'platform', repository: () => TermsConsentRepository })
export class TermsConsent
  extends CoreEntity<TermsConsent> {
  @ManyToOne(() => Member)
  member!: Rel<Member>;

  @ManyToOne(() => TermsVersion)
  termsVersion!: Rel<TermsVersion>;

  @Property({ type: 'boolean' })
  agreed!: boolean;
}
