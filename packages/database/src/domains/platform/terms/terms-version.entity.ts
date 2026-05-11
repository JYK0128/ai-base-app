import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { TermsDocument } from './terms-document.entity';
import { TermsVersionRepository } from './terms-version.repository';

export enum TermsVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity({ schema: 'platform', repository: () => TermsVersionRepository })
@Unique({ properties: ['termsDocument', 'versionLabel'] })
export class TermsVersion extends CoreEntity<TermsVersion> {
  @Index()
  @ManyToOne(() => TermsDocument)
  termsDocument!: Rel<TermsDocument>;

  @Property()
  versionLabel!: string;

  @Property({ type: 'text' })
  contentMd!: string;

  @Property({ type: 'text', nullable: true })
  contentHtml?: string | null = null;

  @Property({ nullable: true })
  checksumSha256?: string | null = null;

  @Enum(() => TermsVersionStatus)
  status: TermsVersionStatus & Opt = TermsVersionStatus.DRAFT;

  @Property({ nullable: true })
  effectiveFrom?: Date | null = null;

  @Property({ nullable: true })
  effectiveTo?: Date | null = null;

  @Property({ nullable: true })
  publishedAt?: Date | null = null;

  @Property({ nullable: true })
  publishedBy?: string | null = null;
}
