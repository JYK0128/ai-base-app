import type { ObjectQuery } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Announcement } from '@pkg/database';
import { AnnouncementStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';

import { FilterableRequestDto, PageRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const ANNOUNCEMENT_PAGE_SORT = ['createdAt'] as const;

class GetAnnouncementPageFilters extends FilterableRequestDto<Announcement> {
  @ApiPropertyOptional({ description: '게시된 공지만 조회할지 여부', example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ enum: AnnouncementStatus, description: '게시 상태', example: AnnouncementStatus.ACTIVE })
  @IsOptional()
  @Type(() => String)
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  toFilterQuery(): ObjectQuery<Announcement> {
    const queries: ObjectQuery<Announcement>[] = [];
    let queryFilter: ObjectQuery<Announcement>;

    if (this.status === AnnouncementStatus.DRAFT) {
      queries.push({ metadata: { publishedAt: null } });
    }
    else if (this.status === AnnouncementStatus.SCHEDULED) {
      queries.push({ metadata: { publishedAt: { $ne: null }, startAt: { $gt: new Date() } } });
    }
    else if (this.status === AnnouncementStatus.ACTIVE) {
      queries.push({
        metadata: {
          publishedAt: { $ne: null },
          startAt: { $lte: new Date() },
          endAt: { $gte: new Date() },
        },
      });
    }
    else if (this.status === AnnouncementStatus.EXPIRED) {
      queries.push({ metadata: { publishedAt: { $ne: null }, endAt: { $lt: new Date() } } });
    }

    if (typeof this.isPublished === 'boolean') {
      queries.push(
        this.isPublished
          ? { metadata: { publishedAt: { $ne: null } } }
          : { metadata: { publishedAt: null } },
      );
    }

    if (queries.length === 0) {
      queryFilter = {};
    }
    else if (queries.length === 1) {
      queryFilter = queries[0];
    }
    else {
      queryFilter = { $and: queries };
    }

    return queryFilter;
  }
}

export class GetAnnouncementPageRequestDto extends PageRequestDto<Announcement> {
  @ApiProperty({ type: () => GetAnnouncementPageFilters, description: '필터 조건' })
  @ValidateNested()
  @Type(() => GetAnnouncementPageFilters)
  filters: GetAnnouncementPageFilters = new GetAnnouncementPageFilters();

  @ApiPropertyOptional({ description: '정렬 필드', isArray: true, enum: ANNOUNCEMENT_PAGE_SORT })
  @IsOptional()
  @IsIn(ANNOUNCEMENT_PAGE_SORT, { each: true })
  @Type(() => String)
  sort: Array<SortKey<Announcement>> = ['createdAt'];

  @ApiPropertyOptional({ description: '정렬 방향', isArray: true, enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['desc'];
}
