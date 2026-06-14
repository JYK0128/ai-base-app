import { Collection, EntityName, type Opt } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Member } from '../member/member.entity';
import { MemberInvite } from '../member/member.invite.entity';
import { TermsDocument } from '../terms/terms.document.entity';
import { OrganizationRole } from './organization.role.entity';

export enum OrganizationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}

@Embeddable()
export class OrganizationMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<OrganizationMetadata>) {
    Object.assign(this, data);
  }

  @Property({ type: Date, nullable: true })
  approvedAt?: Date | null;

  @Property({ type: Date, nullable: true })
  deactivatedAt?: Date | null;

  @Property({ type: Date, nullable: true })
  rejectedAt?: Date | null;
}

@Entity({ schema: 'platform' })
export class Organization extends CoreEntity<Organization> {
  [EntityName]?: 'Organization';

  @OneToMany(() => Member, (member) => member.organization)
  members = new Collection<Member>(this);

  @OneToMany(() => MemberInvite, (invite) => invite.organization)
  memberInvites = new Collection<MemberInvite>(this);

  @OneToMany(() => OrganizationRole, (role) => role.organization)
  organizationRoles = new Collection<OrganizationRole>(this);

  @OneToMany(() => TermsDocument, (doc) => doc.organization)
  termsDocuments = new Collection<TermsDocument>(this);

  @Property({ type: 'string', unique: true })
  code!: string;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', unique: true })
  email!: string;

  @Property({ persist: false })
  get status(): Opt<OrganizationStatus> {
    const metadata = this.metadata;

    if (metadata?.rejectedAt) {
      return OrganizationStatus.REJECTED;
    }

    if (metadata?.deactivatedAt) {
      return OrganizationStatus.INACTIVE;
    }

    if (metadata?.approvedAt) {
      return OrganizationStatus.ACTIVE;
    }

    return OrganizationStatus.PENDING;
  }

  @Property({ persist: false })
  get isActive(): Opt<boolean> {
    return this.status === OrganizationStatus.ACTIVE;
  }

  @Embedded({ entity: () => OrganizationMetadata, object: true })
  override metadata: Opt<OrganizationMetadata> = new OrganizationMetadata();
}
