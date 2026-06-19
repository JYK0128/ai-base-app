import { EntityName, type Opt } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, Enum, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementPriority, AnnouncementStatus } from './announcement.constants';
import { isAnnouncementPublished } from './announcement.policy-publication';
import { getAnnouncementStatus } from './announcement.policy-status';

@Embeddable()
export class AnnouncementMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<AnnouncementMetadata>) {
    Object.assign(this, data);
  }

  @Enum({ items: () => AnnouncementCategory })
  category: AnnouncementCategory = AnnouncementCategory.NOTICE;

  @Enum({ items: () => AnnouncementAudience })
  audience: AnnouncementAudience = AnnouncementAudience.ORGANIZATION;

  @Enum({ items: () => AnnouncementChannel })
  channel: AnnouncementChannel = AnnouncementChannel.IN_APP;

  @Enum({ items: () => AnnouncementPriority })
  priority: AnnouncementPriority = AnnouncementPriority.NORMAL;

  @Property({ type: 'boolean' })
  pinned: boolean = false;

  @Property({ type: Date, nullable: true })
  publishedAt?: Date | null;

  @Property({ type: Date })
  startAt?: Date;

  @Property({ type: Date })
  endAt?: Date;
}

@Entity({ schema: 'platform' })
export class Announcement extends CoreEntity<Announcement> {
  [EntityName]?: 'Announcement';

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Embedded({ entity: () => AnnouncementMetadata, object: true })
  override metadata: Opt<AnnouncementMetadata> = new AnnouncementMetadata();

  @Property({ persist: false })
  get category(): Opt<AnnouncementCategory> {
    return this.metadata.category;
  }

  @Property({ persist: false })
  get audience(): Opt<AnnouncementAudience> {
    return this.metadata.audience;
  }

  @Property({ persist: false })
  get channel(): Opt<AnnouncementChannel> {
    return this.metadata.channel;
  }

  @Property({ persist: false })
  get priority(): Opt<AnnouncementPriority> {
    return this.metadata.priority;
  }

  @Property({ persist: false })
  get pinned(): Opt<boolean> {
    return this.metadata.pinned;
  }

  @Property({ persist: false })
  get publishedAt(): Opt<Date> | null {
    return this.metadata.publishedAt ?? null;
  }

  @Property({ persist: false })
  get startAt(): Opt<Date> | null {
    return this.metadata.startAt ?? null;
  }

  @Property({ persist: false })
  get endAt(): Opt<Date> | null {
    return this.metadata.endAt ?? null;
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
