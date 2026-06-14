import { Collection, EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { TermsVersion } from './terms.version.entity';

export enum TermsDocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  TERMINATED = 'TERMINATED',
}

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
  organization?: Rel<Organization>;

  @OneToMany(() => TermsVersion, (version) => version.termsDocument)
  versions = new Collection<TermsVersion>(this);

  @Property({ type: 'string', unique: true })
  code!: string;

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'boolean' })
  required!: boolean;

  @Embedded({ entity: () => TermsDocumentMetadata, object: true, nullable: true })
  override metadata: Opt<TermsDocumentMetadata> = new TermsDocumentMetadata();

  @Property({ persist: false })
  get scope(): Opt<'platform' | 'organization'> {
    return this.organization ? 'organization' : 'platform';
  }

  @Property({ persist: false })
  get isDraft(): Opt<boolean> {
    return this.status === TermsDocumentStatus.DRAFT;
  }

  @Property({ persist: false })
  get isPublished(): Opt<boolean> {
    return this.status === TermsDocumentStatus.PUBLISHED;
  }

  @Property({ persist: false })
  get status(): Opt<TermsDocumentStatus> {
    if (!this.publishedAt) {
      return TermsDocumentStatus.DRAFT;
    }

    if (this.terminatedAt && this.terminatedAt.getTime() <= Date.now()) {
      return TermsDocumentStatus.TERMINATED;
    }

    return TermsDocumentStatus.PUBLISHED;
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
    return this.status === TermsDocumentStatus.TERMINATED;
  }

  @Property({ persist: false })
  get isScheduledForTermination(): Opt<boolean> {
    return !!this.publishedAt && !!this.deprecatedAt && this.deprecatedAt.getTime() > Date.now();
  }
}
