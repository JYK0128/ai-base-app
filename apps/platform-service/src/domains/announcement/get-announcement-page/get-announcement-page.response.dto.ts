import { ApiProperty } from '@nestjs/swagger';
import { Announcement, AnnouncementAudience, AnnouncementCategory, AnnouncementPriority, AnnouncementStatus } from '@pkg/database';

import { EntityResponseType, PageResponseDto } from '@/common/interfaces';
export class AnnouncementPageItem extends EntityResponseType(Announcement) {
  constructor(announcement: Announcement) {
    super();
    this.id = announcement.id;
    this.title = announcement.title;
    this.content = announcement.content;
    this.createdAt = announcement.createdAt;
    this.updatedAt = announcement.updatedAt ?? announcement.createdAt;
    this.category = announcement.category;
    this.audience = announcement.audience;
    this.priority = announcement.priority;
    this.pinned = announcement.pinned;
    this.publishedAt = announcement.publishedAt ?? null;
    this.startAt = announcement.startAt ?? null;
    this.endAt = announcement.endAt ?? null;
    this.status = announcement.status;
    this.isPublished = Boolean(announcement.isPublished);
    this.author = announcement.author;
  }

  @ApiProperty({ type: String, description: '공지사항 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '공지사항 제목' })
  override title!: string;

  @ApiProperty({ type: String, description: '공지사항 본문 내용' })
  override content!: string;

  @ApiProperty({ type: String, description: '생성 일시' })
  override createdAt!: Date;

  @ApiProperty({ type: String, description: '수정 일시' })
  override updatedAt!: Date;

  @ApiProperty({ enum: AnnouncementCategory, description: '공지 분류' })
  override category!: AnnouncementCategory;

  @ApiProperty({ enum: AnnouncementAudience, description: '공지 대상' })
  override audience!: AnnouncementAudience;

  @ApiProperty({ enum: AnnouncementPriority, description: '공지 우선순위' })
  override priority!: AnnouncementPriority;

  @ApiProperty({ type: Boolean, description: '상단 고정 여부' })
  override pinned!: boolean;

  @ApiProperty({ type: String, nullable: true, description: '게시 확정 일시' })
  override publishedAt!: Date | null;

  @ApiProperty({ type: String, nullable: true, description: '게시 시작일' })
  override startAt!: Date | null;

  @ApiProperty({ type: String, nullable: true, description: '게시 종료일' })
  override endAt!: Date | null;

  @ApiProperty({ enum: AnnouncementStatus, description: '게시 상태' })
  override status!: AnnouncementStatus;

  @ApiProperty({ type: Boolean, description: '게시 확정 여부' })
  override isPublished!: boolean;

  @ApiProperty({ type: String, description: '작성자', readOnly: true })
  override author!: string;
}
export class GetAnnouncementPageResponseDto extends PageResponseDto<AnnouncementPageItem> {
  constructor(args: PageResponseDto<AnnouncementPageItem>) {
    super();
    this.items = args.items;
    this.totalCount = args.totalCount;
    this.page = args.page;
    this.totalPages = args.totalPages;
    this.hasNextPage = args.hasNextPage;
    this.hasPrevPage = args.hasPrevPage;
  }

  @ApiProperty({ type: () => [AnnouncementPageItem], description: '공지사항 목록' })
  items!: AnnouncementPageItem[];
}
