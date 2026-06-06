import { ApiPropertyOptional } from '@nestjs/swagger';
import { Announcement, AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementPriority } from '@pkg/database';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto implements Pick<Announcement, 'title' | 'content'> {
  @ApiPropertyOptional({ example: 'announcement-001', description: '공지사항 식별자' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ example: '새 기능 출시', description: '공지사항 제목' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: '새 기능에 대한 설명...', description: '공지사항 본문' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: 'NOTICE', enum: AnnouncementCategory, description: '공지 분류' })
  @IsOptional()
  @IsEnum(AnnouncementCategory)
  category?: AnnouncementCategory;

  @ApiPropertyOptional({ example: 'ALL', enum: AnnouncementAudience, description: '공지 대상' })
  @IsOptional()
  @IsEnum(AnnouncementAudience)
  audience?: AnnouncementAudience;

  @ApiPropertyOptional({ example: 'IN_APP', enum: AnnouncementChannel, description: '공지 채널' })
  @IsOptional()
  @IsEnum(AnnouncementChannel)
  channel?: AnnouncementChannel;

  @ApiPropertyOptional({ example: 'NORMAL', enum: AnnouncementPriority, description: '공지 우선순위' })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({ example: false, description: '상단 고정 여부' })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z', description: '게시 확정 일시' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z', description: '게시 시작일' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2026-06-10T00:00:00.000Z', description: '게시 종료일' })
  @IsOptional()
  @IsDateString()
  endAt?: string;
}

export class GetAnnouncementsQueryDto {
  @ApiPropertyOptional({ example: false, description: '게시 확정된 공지사항만 조회 여부' })
  @IsOptional()
  @IsBoolean()
  isPublishedOnly?: boolean;
}
