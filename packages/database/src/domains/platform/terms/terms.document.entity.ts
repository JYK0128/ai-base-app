import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { TermsDocumentRepository } from './terms.document.repository';
import { TermsVersion } from './terms.version.entity';

export enum TermsDocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity({ schema: 'platform', repository: () => TermsDocumentRepository })
export class TermsDocument extends CoreEntity<TermsDocument> {
  @Property({ type: 'string', unique: true })
  code!: string;

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'boolean' })
  required!: boolean;

  @Enum(() => TermsDocumentStatus)
  status: Opt<TermsDocumentStatus> = TermsDocumentStatus.DRAFT;

  @Property({ type: Date, nullable: true })
  deprecatedAt?: Date;

  @ManyToOne(() => Organization, { nullable: true })
  organization?: Rel<Organization>;

  @ManyToOne(() => TermsVersion, { nullable: true })
  latestVersion?: Rel<TermsVersion>;

  @OneToMany(() => TermsVersion, (version) => version.termsDocument)
  versions = new Collection<TermsVersion>(this);

  get isDraft(): Opt<boolean> {
    return this.status === TermsDocumentStatus.DRAFT;
  }

  get isPublished(): Opt<boolean> {
    return this.status === TermsDocumentStatus.PUBLISHED;
  }

  get isDeprecated(): Opt<boolean> {
    return !!this.deprecatedAt && this.deprecatedAt.getTime() <= Date.now();
  }

  get isScheduledForDeprecation(): Opt<boolean> {
    return !!this.deprecatedAt && this.deprecatedAt.getTime() > Date.now();
  }
}
