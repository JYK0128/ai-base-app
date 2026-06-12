import type { Announcement, AnnouncementMetadata } from '@pkg/database';

export class AnnouncementResponseDto implements
  Pick<Announcement, 'id' | 'title' | 'content' | 'createdAt' | 'updatedAt'>,
  Pick<AnnouncementMetadata, 'category' | 'audience' | 'channel' | 'priority' | 'pinned' | 'publishedAt' | 'startAt' | 'endAt'> {
  constructor(announcement: Announcement) {
    const { metadata } = announcement;

    this.id = announcement.id;
    this.title = announcement.title;
    this.content = announcement.content;
    this.createdAt = announcement.createdAt;
    this.updatedAt = announcement.updatedAt;
    this.category = metadata.category;
    this.audience = metadata.audience;
    this.channel = metadata.channel;
    this.priority = metadata.priority;
    this.pinned = metadata.pinned;
    this.publishedAt = metadata.publishedAt;
    this.startAt = metadata.startAt;
    this.endAt = metadata.endAt;
  }

  id!: string;
  title!: string;
  content!: string;
  createdAt!: Date;
  updatedAt?: Date;
  category!: AnnouncementMetadata['category'];
  audience!: AnnouncementMetadata['audience'];
  channel!: AnnouncementMetadata['channel'];
  priority!: AnnouncementMetadata['priority'];
  pinned!: boolean;
  publishedAt!: Date;
  startAt!: Date;
  endAt!: Date;
}
