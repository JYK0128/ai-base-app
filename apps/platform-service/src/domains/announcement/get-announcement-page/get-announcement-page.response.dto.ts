import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Announcement, AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementMetadata, AnnouncementPriority, AnnouncementStatus } from '@pkg/database';

import { EntityResponseType, PageResponseDto } from '@/common/interfaces';

export class AnnouncementPageItem extends EntityResponseType(Announcement) {
  constructor(announcement: Announcement) {
    super();
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
  override id!: string;

  @ApiProperty({ example: '시스템 점검 안내', description: '공지사항 제목' })
  override title!: string;

  @ApiProperty({ example: '더 나은 서비스 제공을 위해 시스템 점검을 진행합니다.', description: '공지사항 본문 내용' })
  override content!: string;

  @ApiProperty({ example: '2026-06-06T13:00:00.000Z', description: '생성 일시' })
  override createdAt!: Date;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '수정 일시' })
  override updatedAt?: Date;

  @ApiProperty({ enum: AnnouncementCategory, example: AnnouncementCategory.NOTICE, description: '공지 분류' })
  override category!: AnnouncementCategory;

  @ApiProperty({ enum: AnnouncementAudience, example: AnnouncementAudience.ORGANIZATION, description: '공지 대상' })
  override audience!: AnnouncementAudience;

  @ApiProperty({ enum: AnnouncementChannel, example: AnnouncementChannel.IN_APP, description: '공지 채널' })
  override channel!: AnnouncementChannel;

  @ApiProperty({ enum: AnnouncementPriority, example: AnnouncementPriority.NORMAL, description: '공지 우선순위' })
  override priority!: AnnouncementPriority;

  @ApiProperty({ example: true, description: '상단 고정 여부' })
  override pinned!: boolean;

  @ApiPropertyOptional({ example: '2026-06-06T15:00:00.000Z', description: '게시 확정 일시' })
  override publishedAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-07T00:00:00.000Z', description: '게시 시작일' })
  override startAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z', description: '게시 종료일' })
  override endAt?: Date;

  @ApiProperty({ enum: AnnouncementStatus, example: AnnouncementStatus.ACTIVE, description: '게시 상태' })
  override status!: AnnouncementStatus;

  @ApiProperty({ example: true, description: '게시 확정 여부' })
  override isPublished!: boolean;

  @ApiProperty({ example: 'system', description: '작성자', readOnly: true })
  override author!: string;
}

export class GetAnnouncementPageResponseDto extends PageResponseDto<AnnouncementPageItem> {
  constructor(args: PageResponseDto<AnnouncementPageItem>) {
    super();
    this.items = args.items;
    this.totalCount = args.totalCount;
    this.page = args.page;
    this.limit = args.limit;
    this.totalPages = args.totalPages;
    this.hasNextPage = args.hasNextPage;
    this.hasPrevPage = args.hasPrevPage;
  }

  @ApiProperty({ type: () => [AnnouncementPageItem], example: [], description: '공지사항 목록' })
  items!: AnnouncementPageItem[];
}
