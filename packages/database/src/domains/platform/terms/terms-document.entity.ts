import { Collection, EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { TermsDocumentStatus } from './terms-document.constants';
import { getTermsDocumentStatus,
         isTermsDocumentDraft,
         isTermsDocumentPublished,
         isTermsDocumentScheduledForTermination,
         isTermsDocumentTerminated } from './terms-document.policy-status';
import { TermsVersion } from './terms-version.entity';

@Embeddable()
export class TermsDocumentMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<TermsDocumentMetadata>) {
    Object.assign(this, data);
  }

  @Property({ type: Date, nullable: true })
  publishedAt: Date | null = null;

  @Property({ type: Date, nullable: true })
  terminatedAt: Date | null = null;
}

@Entity({ schema: 'platform' })
export class TermsDocument extends CoreEntity<TermsDocument> {
  [EntityName]?: 'TermsDocument';

  @ManyToOne(() => Organization, { nullable: true })
  organization: Rel<Organization> | null = null;

  @OneToMany(() => TermsVersion, (version) => version.termsDocument)
  versions = new Collection<TermsVersion>(this);

  @Property({ type: 'string', unique: true })
  code!: string;

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'boolean' })
  required!: boolean;

  @Embedded({ entity: () => TermsDocumentMetadata, object: true })
  override metadata: Opt<TermsDocumentMetadata> = new TermsDocumentMetadata();

  @Property({ persist: false })
  get scope(): Opt<'platform' | 'organization'> {
    return this.organization ? 'organization' : 'platform';
  }

  @Property({ persist: false })
  get isDraft(): Opt<boolean> {
    return isTermsDocumentDraft(this.status);
  }

  @Property({ persist: false })
  get isPublished(): Opt<boolean> {
    return isTermsDocumentPublished(this.status);
  }

  @Property({ persist: false })
  get status(): Opt<TermsDocumentStatus> {
    return getTermsDocumentStatus(this.metadata);
  }

  @Property({ persist: false })
  get publishedAt(): Opt<Date> | null {
    return this.metadata.publishedAt;
  }

  @Property({ persist: false })
  get terminatedAt(): Opt<Date> | null {
    return this.metadata.terminatedAt;
  }

  @Property({ persist: false })
  get isTerminated(): Opt<boolean> {
    return isTermsDocumentTerminated(this.status);
  }

  @Property({ persist: false })
  get isScheduledForTermination(): Opt<boolean> {
    return isTermsDocumentScheduledForTermination(this.metadata);
  }
}
