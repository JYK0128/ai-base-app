import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Announcement } from '@pkg/database';
import { AnnouncementStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { ValidateNested } from 'class-validator';

import { type FilterRequestDto, type PageRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

class GetAnnouncementPageFilters implements FilterRequestDto<Announcement> {
  @ApiPropertyOptional({ description: '게시된 공지만 조회할지 여부', example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ enum: AnnouncementStatus, description: '게시 상태', example: AnnouncementStatus.ACTIVE })
  @IsOptional()
  status?: AnnouncementStatus;
}

export class GetAnnouncementPageRequestDto implements PageRequestDto<Announcement> {
  @ApiProperty({ type: GetAnnouncementPageFilters, description: '필터 조건' })
  @ValidateNested()
  @Type(() => GetAnnouncementPageFilters)
  filter: GetAnnouncementPageFilters = new GetAnnouncementPageFilters();

  @ApiPropertyOptional({ description: '정렬 필드', example: ['createdAt'], default: ['createdAt'], isArray: true })
  sort: Array<SortKey<Announcement>> = ['createdAt'];

  @ApiPropertyOptional({ description: '정렬 방향', enum: SortDirection, example: [SortDirection.DESC], default: [SortDirection.DESC], isArray: true })
  direction: SortDirection[] = [SortDirection.DESC];

  @ApiPropertyOptional({ description: '페이지 번호', example: 1, default: 1 })
  page = 1;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20, default: 20 })
  limit = 20;
}
