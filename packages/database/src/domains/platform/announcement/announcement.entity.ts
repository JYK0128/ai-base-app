import { EntityName, type Opt } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, Enum, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { AnnouncementAudience, AnnouncementCategory, AnnouncementPriority, AnnouncementStatus } from './announcement.constants';
import { isAnnouncementPublished } from './announcement.policy-publication';
import { getAnnouncementStatus } from './announcement.policy-status';

@Embeddable()
export class AnnouncementMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<AnnouncementMetadata>) {
    Object.assign(this, data);
  }

  @Property({ type: Date, nullable: true })
  publishedAt: Date | null = null;

  @Property({ type: Date })
  startAt!: Date;

  @Property({ type: Date })
  endAt!: Date;
}

@Entity({ schema: 'platform' })
export class Announcement extends CoreEntity<Announcement> {
  [EntityName]?: 'Announcement';

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Enum(() => AnnouncementCategory)
  category: Opt<AnnouncementCategory> = AnnouncementCategory.NOTICE;

  @Enum(() => AnnouncementAudience)
  audience: Opt<AnnouncementAudience> = AnnouncementAudience.ORGANIZATION;

  @Enum(() => AnnouncementPriority)
  priority: Opt<AnnouncementPriority> = AnnouncementPriority.NORMAL;

  @Property({ type: 'boolean' })
  pinned: Opt<boolean> = false;

  @Embedded({ entity: () => AnnouncementMetadata, object: true })
  override metadata: Opt<AnnouncementMetadata> = new AnnouncementMetadata();

  @Property({ persist: false })
  get publishedAt(): Opt<Date> | null {
    return this.metadata.publishedAt;
  }

  @Property({ persist: false })
  get startAt(): Opt<Date> | null {
    return this.metadata.startAt;
  }

  @Property({ persist: false })
  get endAt(): Opt<Date> | null {
    return this.metadata.endAt;
  }

  @Property({ persist: false })
  get status(): Opt<AnnouncementStatus> {
    return getAnnouncementStatus(this.metadata);
  }

  @Property({ persist: false })
  get isPublished(): Opt<boolean> {
    return isAnnouncementPublished(this.metadata.publishedAt);
  }

  @Property({ persist: false })
  get author(): Opt<string> {
    return this.createdBy ?? this.updatedBy ?? '';
  }
}
