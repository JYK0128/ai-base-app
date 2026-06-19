import type { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, buildAnnouncementPublishedFilter, buildAnnouncementStatusFilter, CoreRepository } from '@pkg/database';

import { GetAnnouncementPageContract } from './get-announcement-page.contract';
import { GetAnnouncementPageItemResponseDto, GetAnnouncementPageResponseDto } from './get-announcement-page.response.dto';

@QueryHandler(GetAnnouncementPageContract)
export class GetAnnouncementPageHandler implements IQueryHandler<GetAnnouncementPageContract> {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: CoreRepository<Announcement>,
  ) {}

  async execute({ data }: GetAnnouncementPageContract): Promise<GetAnnouncementPageResponseDto> {
    const filter = data.filter;
    const announcementsPage = await this.announcementRepository.findByPage(
      this.buildAnnouncementsQueryFilter(filter?.status, filter?.isPublished),
      {
        orderBy: { createdAt: 'DESC' },
        page: data.page,
        limit: data.limit,
      },
    );

    return new GetAnnouncementPageResponseDto(
      announcementsPage.items.map((announcement) => new GetAnnouncementPageItemResponseDto(announcement)),
      announcementsPage.totalCount,
      announcementsPage.page,
      announcementsPage.limit,
      announcementsPage.totalPages,
      announcementsPage.hasNextPage,
      announcementsPage.hasPrevPage,
    );
  }

  private buildAnnouncementsQueryFilter(
    status: Parameters<typeof buildAnnouncementStatusFilter>[0],
    isPublished: Parameters<typeof buildAnnouncementPublishedFilter>[0],
  ): FilterQuery<Announcement> {
    const filters: FilterQuery<Announcement>[] = [
      buildAnnouncementStatusFilter(status),
      buildAnnouncementPublishedFilter(isPublished),
    ].filter((filter) => Object.keys(filter).length > 0);

    let queryFilter: FilterQuery<Announcement> = {};

    if (filters.length === 1) {
      queryFilter = filters[0];
    }

    if (filters.length > 1) {
      queryFilter = { $and: filters };
    }

    return queryFilter;
  }
}
