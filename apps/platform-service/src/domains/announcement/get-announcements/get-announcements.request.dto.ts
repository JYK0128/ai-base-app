import { ApiPropertyOptional } from '@nestjs/swagger';
import type { Announcement } from '@pkg/database';
import { AnnouncementStatus } from '@pkg/database';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { type ListRequestDto, SortDirection } from '@/common/interfaces';

export class GetAnnouncementsRequestDto implements ListRequestDto<Announcement> {
  @ApiPropertyOptional({
    description: '정렬 필드',
    example: ['createdAt'],
    default: ['createdAt'],
    isArray: true,
  })
  sort!: Array<keyof Announcement & string>;

  @ApiPropertyOptional({
    description: '정렬 방향',
    enum: SortDirection,
    example: [SortDirection.DESC],
    default: [SortDirection.DESC],
    isArray: true,
  })
  direction!: SortDirection[];

  @ApiPropertyOptional({
    description: '오프셋',
    example: 0,
    default: 0,
  })
  offset!: number;

  @ApiPropertyOptional({
    description: '페이지 크기',
    example: 20,
    default: 20,
  })
  limit!: number;

  @ApiPropertyOptional({
    description: '게시된 공지만 조회할지 여부',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isPublished?: boolean;

  @ApiPropertyOptional({
    enum: AnnouncementStatus,
    description: '게시 상태',
    example: AnnouncementStatus.ACTIVE,
  })
  @IsOptional()
  status?: AnnouncementStatus;
}
