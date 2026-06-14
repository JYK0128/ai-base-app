import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementPriority } from '@pkg/database';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';

export class SaveAnnouncementRequestDto {
  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7091', description: '공지사항 식별자' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: '공지 제목', description: '공지사항 제목' })
  @IsNotEmptyString({ message: '제목은 공백만으로 구성될 수 없습니다.' })
  title!: string;

  @ApiProperty({ example: '공지 본문', description: '공지사항 본문' })
  @IsNotEmptyString({ message: '본문은 공백만으로 구성될 수 없습니다.' })
  content!: string;

  @ApiPropertyOptional({ enum: AnnouncementCategory, example: AnnouncementCategory.NOTICE, description: '공지 분류' })
  @IsOptional()
  @IsEnum(AnnouncementCategory)
  category?: AnnouncementCategory;

  @ApiPropertyOptional({ enum: AnnouncementAudience, example: AnnouncementAudience.ORGANIZATION, description: '공지 대상' })
  @IsOptional()
  @IsEnum(AnnouncementAudience)
  audience?: AnnouncementAudience;

  @ApiPropertyOptional({ enum: AnnouncementChannel, example: AnnouncementChannel.IN_APP, description: '공지 채널' })
  @IsOptional()
  @IsEnum(AnnouncementChannel)
  channel?: AnnouncementChannel;

  @ApiPropertyOptional({ enum: AnnouncementPriority, example: AnnouncementPriority.NORMAL, description: '공지 우선순위' })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({ example: false, description: '게시 유무' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '2026-06-13T03:11:56.000Z', description: '게시 확정 일시' })
  @IsOptional()
  @IsString()
  publishedAt?: string;

  @ApiPropertyOptional({ example: '2026-06-13T03:11:56.000Z', description: '게시 시작일' })
  @IsOptional()
  @IsString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2026-06-20T03:11:56.000Z', description: '게시 종료일' })
  @IsOptional()
  @IsString()
  endAt?: string;
}
