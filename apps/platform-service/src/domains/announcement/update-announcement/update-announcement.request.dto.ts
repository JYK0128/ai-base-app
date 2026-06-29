import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Announcement } from '@pkg/database';
import { AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementPriority } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import { EntityRequestType } from '@/common/interfaces';

export class UpdateAnnouncementRequestDto extends EntityRequestType(Announcement) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '공지사항 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiProperty({ example: '공지 제목', description: '공지사항 제목' })
  @Type(() => String)
  @IsNotEmptyString({ message: '제목은 공백만으로 구성될 수 없습니다.' })
  override title!: string;

  @ApiProperty({ example: '공지 본문', description: '공지사항 본문' })
  @Type(() => String)
  @IsNotEmptyString({ message: '본문은 공백만으로 구성될 수 없습니다.' })
  override content!: string;

  @ApiPropertyOptional({ enum: AnnouncementCategory, example: AnnouncementCategory.NOTICE, description: '공지 분류' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(AnnouncementCategory)
  override category?: AnnouncementCategory;

  @ApiPropertyOptional({ enum: AnnouncementAudience, example: AnnouncementAudience.ORGANIZATION, description: '공지 대상' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(AnnouncementAudience)
  override audience?: AnnouncementAudience;

  @ApiPropertyOptional({ enum: AnnouncementChannel, example: AnnouncementChannel.IN_APP, description: '공지 채널' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(AnnouncementChannel)
  override channel?: AnnouncementChannel;

  @ApiPropertyOptional({ enum: AnnouncementPriority, example: AnnouncementPriority.NORMAL, description: '공지 우선순위' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(AnnouncementPriority)
  override priority?: AnnouncementPriority;

  @ApiPropertyOptional({ example: false, description: '게시 유무' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  override isPublished?: boolean;

  @ApiPropertyOptional({ example: true, description: '공지 목록에서 우선 노출할지 여부' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  override pinned?: boolean;

  @ApiPropertyOptional({ example: '2026-06-13T03:11:56.000Z', description: '게시 확정 일시' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  override publishedAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-13T03:11:56.000Z', description: '게시 시작일' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  override startAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-20T03:11:56.000Z', description: '게시 종료일' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  override endAt?: Date;
}
