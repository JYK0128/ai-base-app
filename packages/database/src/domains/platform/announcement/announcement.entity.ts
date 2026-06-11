import { EntityName, type Opt } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, Enum, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';

export enum AnnouncementCategory {
  NOTICE = 'NOTICE',
  MAINTENANCE = 'MAINTENANCE',
  SECURITY = 'SECURITY',
  EVENT = 'EVENT',
}

export enum AnnouncementAudience {
  ALL = 'ALL',
  PLATFORM = 'PLATFORM',
  ORGANIZATION = 'ORGANIZATION',
}

export enum AnnouncementChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
}

export enum AnnouncementPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

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

  @Property({ type: Date })
  publishedAt!: Date;

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

  @Embedded({ entity: () => AnnouncementMetadata, object: true, nullable: true })
  override metadata: Opt<AnnouncementMetadata> = new AnnouncementMetadata();

  @Property({ persist: false })
  get isPublished(): Opt<boolean> {
    const publishedAt = this.metadata.publishedAt;

    if (!publishedAt) {
      return false;
    }

    const publishedAtTime = publishedAt.getTime();
    return Number.isFinite(publishedAtTime);
  }
}
