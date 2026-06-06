import type { Opt, Rel } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Member } from '../member/member.entity';
import { AnnouncementRepository } from './announcement.repository';

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

  @Enum({ items: () => AnnouncementCategory, nullable: true })
  category?: AnnouncementCategory;

  @Enum({ items: () => AnnouncementAudience, nullable: true })
  audience?: AnnouncementAudience;

  @Enum({ items: () => AnnouncementChannel, nullable: true })
  channel?: AnnouncementChannel;

  @Enum({ items: () => AnnouncementPriority, nullable: true })
  priority?: AnnouncementPriority;

  @Property({ type: 'boolean', nullable: true })
  pinned?: boolean;

  @Property({ type: Date, nullable: true })
  publishedAt?: Date;

  @Property({ type: Date, nullable: true })
  startAt?: Date;

  @Property({ type: Date, nullable: true })
  endAt?: Date;
}

@Entity({ schema: 'platform', repository: () => AnnouncementRepository })
export class Announcement extends CoreEntity<Announcement> {
  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Embedded({ entity: () => AnnouncementMetadata, object: true, nullable: true })
  override metadata: Opt<AnnouncementMetadata> = new AnnouncementMetadata();

  @ManyToOne(() => Member)
  author!: Rel<Member>;

  get isPublished(): Opt<boolean> {
    const publishedAt = this.metadata.publishedAt;

    if (!publishedAt) {
      return false;
    }

    const publishedAtTime = publishedAt.getTime();
    return Number.isFinite(publishedAtTime);
  }
}
