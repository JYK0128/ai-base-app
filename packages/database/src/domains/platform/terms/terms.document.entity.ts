import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from '../organization/organization.entity';
import { TermsDocumentRepository } from './terms.document.repository';
import { TermsVersion } from './terms.version.entity';

export enum TermsDocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEPRECATED = 'DEPRECATED',
}

@Entity({ schema: 'platform', repository: () => TermsDocumentRepository })
export class TermsDocument extends CoreEntity<TermsDocument> {
  @Property()
  code!: string;

  @Property()
  title!: string;

  @Property()
  required!: boolean;

  @Enum(() => TermsDocumentStatus)
  status!: TermsDocumentStatus;

  @ManyToOne(() => Organization, { nullable: true })
  organization?: Rel<Organization>;

  @ManyToOne(() => TermsVersion, { nullable: true })
  latestVersion?: Rel<TermsVersion>;

  @OneToMany(() => TermsVersion, (version) => version.termsDocument)
  versions = new Collection<TermsVersion>(this);
}
