import { Collection, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ManagerTermsConsent } from './manager.terms.consent.entity';
import { TermsDocument } from './terms.document.entity';
import { TermsVersionRepository } from './terms.version.repository';

export enum TermsVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity({ schema: 'platform', repository: () => TermsVersionRepository })
export class TermsVersion
  extends CoreEntity<TermsVersion, 'status'> {
  @ManyToOne(() => TermsDocument)
  termsDocument!: Rel<TermsDocument>;

  @Property()
  label!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property()
  checksum!: string;

  @Enum(() => TermsVersionStatus)
  status: TermsVersionStatus = TermsVersionStatus.DRAFT;

  @Property()
  effectiveFrom!: Date;

  @Property()
  effectiveTo!: Date;

  @OneToMany(() => ManagerTermsConsent, (consent) => consent.termsVersion)
  consents = new Collection<ManagerTermsConsent>(this);
}
