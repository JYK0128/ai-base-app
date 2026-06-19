import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Announcement, AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementMetadata, AnnouncementPriority, AnnouncementStatus } from '@pkg/database';

import type { EntityResponseDto, PageResponseDto } from '@/common/interfaces';

export class GetAnnouncementPageItemResponseDto implements EntityResponseDto<Announcement> {
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
    this.publishedAt = metadata.publishedAt ?? undefined;
    this.startAt = metadata.startAt;
    this.endAt = metadata.endAt;
    this.status = announcement.status;
    this.isPublished = Boolean(announcement.isPublished);
    this.author = announcement.author;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7080', description: '공지사항 식별자' })
  id!: string;

  @ApiProperty({ example: '시스템 점검 안내', description: '공지사항 제목' })
  title!: string;

  @ApiProperty({ example: '더 나은 서비스 제공을 위해 시스템 점검을 진행합니다.', description: '공지사항 본문 내용' })
  content!: string;

  @ApiProperty({ example: '2026-06-06T13:00:00.000Z', description: '생성 일시' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '수정 일시' })
  updatedAt?: Date;

  @ApiProperty({ enum: AnnouncementCategory, example: AnnouncementCategory.NOTICE, description: '공지 분류' })
  category!: AnnouncementCategory;

  @ApiProperty({ enum: AnnouncementAudience, example: AnnouncementAudience.ORGANIZATION, description: '공지 대상' })
  audience!: AnnouncementAudience;

  @ApiProperty({ enum: AnnouncementChannel, example: AnnouncementChannel.IN_APP, description: '공지 채널' })
  channel!: AnnouncementChannel;

  @ApiProperty({ enum: AnnouncementPriority, example: AnnouncementPriority.NORMAL, description: '공지 우선순위' })
  priority!: AnnouncementPriority;

  @ApiProperty({ example: true, description: '상단 고정 여부' })
  pinned!: boolean;

  @ApiPropertyOptional({ example: '2026-06-06T15:00:00.000Z', description: '게시 확정 일시' })
  publishedAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-07T00:00:00.000Z', description: '게시 시작일' })
  startAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z', description: '게시 종료일' })
  endAt?: Date;

  @ApiProperty({ enum: AnnouncementStatus, example: AnnouncementStatus.ACTIVE, description: '게시 상태' })
  status!: AnnouncementStatus;

  @ApiProperty({ example: true, description: '게시 확정 여부' })
  isPublished!: boolean;

  @ApiProperty({ example: 'system', description: '작성자', readOnly: true })
  author!: string;
}

export class GetAnnouncementPageResponseDto implements PageResponseDto<Announcement> {
  constructor(items: GetAnnouncementPageItemResponseDto[], totalCount: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean) {
    this.items = items;
    this.totalCount = totalCount;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages;
    this.hasNextPage = hasNextPage;
    this.hasPrevPage = hasPrevPage;
  }

  @ApiProperty({ type: () => [GetAnnouncementPageItemResponseDto], example: [], description: '공지사항 목록' })
  items!: GetAnnouncementPageItemResponseDto[];

  @ApiProperty({ example: 25, description: '전체 개수' })
  totalCount!: number;

  @ApiProperty({ example: 1, description: '페이지 번호' })
  page!: number;

  @ApiProperty({ example: 10, description: '페이지 크기' })
  limit!: number;

  @ApiProperty({ example: 3, description: '전체 페이지 수' })
  totalPages!: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasNextPage!: boolean;

  @ApiProperty({ example: false, description: '이전 페이지 존재 여부' })
  hasPrevPage!: boolean;
}
