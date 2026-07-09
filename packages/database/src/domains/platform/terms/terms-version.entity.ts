import { Collection, EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { TermsConsent } from './terms-consent.entity';
import { TermsDocument } from './terms-document.entity';
import { TermsVersionStatus } from './terms-version.constants';
import { isTermsVersionCurrentlyEffective,
         isTermsVersionDraft,
         isTermsVersionPublished,
         isTermsVersionScheduledForActivation } from './terms-version.policy-status';

@Entity({ schema: 'platform' })
@Unique({ properties: ['termsDocument', 'label'] })
export class TermsVersion extends CoreEntity<TermsVersion> {
  [EntityName]?: 'TermsVersion';

  @ManyToOne(() => TermsDocument)
  termsDocument!: Rel<TermsDocument>;

  @Property({ type: 'string' })
  label!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property({ type: 'string' })
  checksum!: string;

  @Enum(() => TermsVersionStatus)
  status: Opt<TermsVersionStatus> = TermsVersionStatus.DRAFT;

  @Property({ type: Date })
  effectiveAt!: Date;

  @OneToMany(() => TermsConsent, (consent) => consent.termsVersion)
  consents = new Collection<TermsConsent>(this);

  @Property({ persist: false })
  get isDraft(): Opt<boolean> {
    return isTermsVersionDraft(this.status);
  }

  @Property({ persist: false })
  get isPublished(): Opt<boolean> {
    return isTermsVersionPublished(this.status);
  }

  @Property({ persist: false })
  get isCurrentlyEffective(): Opt<boolean> {
    return isTermsVersionCurrentlyEffective(this.status, this.effectiveAt);
  }

  @Property({ persist: false })
  get isScheduledForActivation(): Opt<boolean> {
    return isTermsVersionScheduledForActivation(this.status, this.effectiveAt);
  }
}
