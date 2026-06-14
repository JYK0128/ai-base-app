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

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
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
  get category(): AnnouncementCategory {
    return this.metadata.category;
  }

  @Property({ persist: false })
  get audience(): AnnouncementAudience {
    return this.metadata.audience;
  }

  @Property({ persist: false })
  get channel(): AnnouncementChannel {
    return this.metadata.channel;
  }

  @Property({ persist: false })
  get priority(): AnnouncementPriority {
    return this.metadata.priority;
  }

  @Property({ persist: false })
  get pinned(): boolean {
    return this.metadata.pinned;
  }

  @Property({ persist: false })
  get publishedAt(): Opt<Date> {
    return this.metadata.publishedAt;
  }

  @Property({ persist: false })
  get startAt(): Opt<Date> {
    return this.metadata.startAt;
  }

  @Property({ persist: false })
  get endAt(): Opt<Date> {
    return this.metadata.endAt;
  }

  @Property({ persist: false })
  get status(): Opt<AnnouncementStatus> {
    const publishedAt = this.publishedAt;

    if (!publishedAt) {
      return AnnouncementStatus.DRAFT;
    }

    const now = Date.now();
    const startAt = this.startAt?.getTime();
    const endAt = this.endAt?.getTime();

    if (typeof startAt === 'number' && startAt > now) {
      return AnnouncementStatus.SCHEDULED;
    }

    if (typeof endAt === 'number' && endAt < now) {
      return AnnouncementStatus.EXPIRED;
    }

    return AnnouncementStatus.ACTIVE;
  }

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
