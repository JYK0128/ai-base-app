import { Collection, EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { TermsConsent } from './terms.consent.entity';
import { TermsDocument } from './terms.document.entity';

export enum TermsVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity({ schema: 'platform' })
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
    return this.status === TermsVersionStatus.DRAFT;
  }

  @Property({ persist: false })
  get isPublished(): Opt<boolean> {
    return this.status === TermsVersionStatus.PUBLISHED;
  }

  @Property({ persist: false })
  get isCurrentlyEffective(): Opt<boolean> {
    return this.isPublished && this.effectiveAt.getTime() <= Date.now();
  }

  @Property({ persist: false })
  get isScheduledForActivation(): Opt<boolean> {
    return this.isPublished && this.effectiveAt.getTime() > Date.now();
  }
}
