import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Announcement, AnnouncementMetadata } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class AnnouncementResponseDto implements EntityResponseDto<Announcement>,
  Pick<Announcement, 'id' | 'title' | 'content' | 'createdAt' | 'updatedAt'>,
  Pick<AnnouncementMetadata, 'category' | 'audience' | 'channel' | 'priority' | 'pinned' | 'publishedAt' | 'startAt' | 'endAt'> {
  constructor(announcement: Announcement) {
    const metadata = announcement.metadata ?? new AnnouncementMetadata();

    this.id = announcement.id;
    this.title = announcement.title;
    this.content = announcement.content;
    this.createdAt = announcement.createdAt;
    this.updatedAt = announcement.updatedAt ?? announcement.createdAt;
    this.category = metadata.category;
    this.audience = metadata.audience;
    this.channel = metadata.channel;
    this.priority = metadata.priority;
    this.pinned = metadata.pinned;
    this.publishedAt = metadata.publishedAt;
    this.startAt = metadata.startAt;
    this.endAt = metadata.endAt;
    this.status = announcement.isPublished ? 'PUBLISHED' : 'DRAFT';
    this.isPublished = Boolean(announcement.isPublished);
    this.author = announcement.createdBy ?? announcement.updatedBy ?? '';
  }

  @ApiProperty({ description: '공지사항 식별자' })
  id!: string;

  @ApiProperty({ description: '공지사항 제목' })
  title!: string;

  @ApiProperty({ description: '공지사항 본문 내용' })
  content!: string;

  @ApiProperty({ description: '생성 일시' })
  createdAt!: Date;

  @ApiProperty({ description: '수정 일시' })
  updatedAt?: Date;

  @ApiProperty({ enum: ['NOTICE', 'MAINTENANCE', 'SECURITY', 'EVENT'], description: '공지 분류' })
  category!: AnnouncementMetadata['category'];

  @ApiProperty({ enum: ['ALL', 'PLATFORM', 'ORGANIZATION'], description: '공지 대상' })
  audience!: AnnouncementMetadata['audience'];

  @ApiProperty({ enum: ['IN_APP', 'EMAIL', 'PUSH'], description: '공지 채널' })
  channel!: AnnouncementMetadata['channel'];

  @ApiProperty({ enum: ['LOW', 'NORMAL', 'HIGH'], description: '공지 우선순위' })
  priority!: AnnouncementMetadata['priority'];

  @ApiProperty({ description: '상단 고정 여부' })
  pinned!: boolean;

  @ApiPropertyOptional({ description: '게시 확정 일시' })
  publishedAt!: Date;

  @ApiPropertyOptional({ description: '게시 시작일' })
  startAt!: Date;

  @ApiPropertyOptional({ description: '게시 종료일' })
  endAt!: Date;

  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED'], description: '게시 상태' })
  status!: 'DRAFT' | 'PUBLISHED';

  @ApiProperty({ description: '게시 확정 여부' })
  isPublished!: boolean;

  @ApiProperty({ description: '작성자' })
  author!: string;
}
