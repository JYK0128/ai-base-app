import { ApiProperty } from '@nestjs/swagger';
import { Announcement } from '@pkg/database';
import { AnnouncementAudience,
         AnnouncementCategory,
         AnnouncementPriority } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import { EntityRequestType } from '@/common/interfaces';

export class CreateAnnouncementRequestDto extends EntityRequestType(Announcement) {
  @ApiProperty({ example: '공지 제목', type: String, description: '공지사항 제목' })
  @Type(() => String)
  @IsNotEmptyString({ message: '제목은 공백만으로 구성될 수 없습니다.' })
  override title!: string;

  @ApiProperty({ example: '공지 본문', type: String, description: '공지사항 본문' })
  @Type(() => String)
  @IsNotEmptyString({ message: '본문은 공백만으로 구성될 수 없습니다.' })
  override content!: string;

  @ApiProperty({ example: AnnouncementCategory.NOTICE, enum: AnnouncementCategory, description: '공지 분류' })
  @Type(() => String)
  @IsEnum(AnnouncementCategory)
  override category!: AnnouncementCategory;

  @ApiProperty({ example: AnnouncementAudience.ORGANIZATION, enum: AnnouncementAudience, description: '공지 대상' })
  @Type(() => String)
  @IsEnum(AnnouncementAudience)
  override audience!: AnnouncementAudience;

  @ApiProperty({ example: AnnouncementPriority.NORMAL, enum: AnnouncementPriority, description: '공지 우선순위' })
  @Type(() => String)
  @IsEnum(AnnouncementPriority)
  override priority!: AnnouncementPriority;

  @ApiProperty({ example: true, type: Boolean, description: '공지 목록에서 우선 노출할지 여부' })
  @Type(() => Boolean)
  @IsBoolean()
  override pinned!: boolean;

  @ApiProperty({ example: '2026-06-13T03:11:56.000Z', type: String, description: '게시 시작일' })
  @Type(() => Date)
  @IsDate()
  override startAt!: Date;

  @ApiProperty({ example: '2026-06-20T03:11:56.000Z', type: String, description: '게시 종료일' })
  @Type(() => Date)
  @IsDate()
  override endAt!: Date;

  @ApiProperty({ example: '2026-06-13T03:11:56.000Z', type: String, nullable: true, description: '게시 확정 일시' })
  @Type(() => Date)
  @IsDate()
  override publishedAt!: Date | null;
}
