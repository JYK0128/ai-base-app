import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Announcement, AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementMetadata, AnnouncementPriority } from '@pkg/database';

export class AnnouncementResponseDto implements Pick<Announcement, 'id' | 'title' | 'content' | 'createdAt' | 'updatedAt'>, Pick<AnnouncementMetadata, 'category' | 'audience' | 'channel' | 'priority' | 'pinned' | 'publishedAt' | 'startAt' | 'endAt'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '공지사항 식별자' })
  id!: string;

  @ApiProperty({ example: '새 기능 출시 공지', description: '공지사항 제목' })
  title!: string;

  @ApiProperty({ example: '새 기능이 출시되었습니다. 많이 이용해주세요.', description: '공지사항 본문 내용' })
  content!: string;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '생성 일시' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '수정 일시' })
  updatedAt!: Date;

  @ApiProperty({ enum: AnnouncementCategory, example: 'NOTICE', description: '공지 분류' })
  category!: AnnouncementCategory;

  @ApiProperty({ enum: AnnouncementAudience, example: 'ALL', description: '공지 대상' })
  audience!: AnnouncementAudience;

  @ApiProperty({ enum: AnnouncementChannel, example: 'IN_APP', description: '공지 채널' })
  channel!: AnnouncementChannel;

  @ApiProperty({ enum: AnnouncementPriority, example: 'NORMAL', description: '공지 우선순위' })
  priority!: AnnouncementPriority;

  @ApiProperty({ example: false, description: '상단 고정 여부' })
  pinned!: boolean;

  @ApiPropertyOptional({ example: '2026-06-06T14:00:00.000Z', description: '게시 확정 일시' })
  publishedAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-06T14:00:00.000Z', description: '게시 시작일' })
  startAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-16T14:00:00.000Z', description: '게시 종료일' })
  endAt?: Date;

  @ApiProperty({ example: '새 기능이 출시되었습니다', description: '공지사항 요약' })
  summary!: string;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED'], description: '게시 상태' })
  status!: string;

  @ApiProperty({ example: true, description: '게시 확정 여부' })
  isPublished!: boolean;

  @ApiProperty({ example: 'admin@platform.com', description: '작성자' })
  author!: string;
}
