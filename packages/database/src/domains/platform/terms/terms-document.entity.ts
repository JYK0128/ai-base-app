import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Check, Entity, Enum, Index, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { TermsDocumentRepository } from './terms-document.repository';
import { TermsVersion } from './terms-version.entity';

export enum TermsGroupType {
  PLATFORM = 'PLATFORM',
  ORGANIZATION = 'ORGANIZATION',
}

export enum TermsDocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEPRECATED = 'DEPRECATED',
}

@Entity({ schema: 'platform', repository: () => TermsDocumentRepository })
@Check<TermsDocument>({
  expression: (columns) => `(("${columns.groupType}" = 'PLATFORM' and "${columns.organization}" is null) or ("${columns.groupType}" = 'ORGANIZATION' and "${columns.organization}" is not null))`,
})
@Index({ properties: ['groupType', 'code'] })
@Index({ properties: ['organization', 'groupType', 'code'] })
export class TermsDocument extends CoreEntity<TermsDocument> {
  @Enum(() => TermsGroupType)
  groupType!: TermsGroupType;

  @Index()
  @Property()
  code!: string;

  @Property()
  title!: string;

  @Property({ default: true })
  required: boolean & Opt = true;

  @Enum(() => TermsDocumentStatus)
  status: TermsDocumentStatus & Opt = TermsDocumentStatus.DRAFT;

  @Index()
  @ManyToOne(() => Organization, { nullable: true })
  organization?: Rel<Organization>;

  @Property({ nullable: true })
  latestVersionId?: string | null = null;

  @Property({ nullable: true })
  deprecatedAt?: Date | null = null;

  @OneToMany(() => TermsVersion, (version) => version.termsDocument)
  versions = new Collection<TermsVersion>(this);
}
