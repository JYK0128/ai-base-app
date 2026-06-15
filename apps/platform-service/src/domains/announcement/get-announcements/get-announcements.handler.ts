import type { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, buildAnnouncementPublishedFilter, buildAnnouncementStatusFilter, CoreRepository } from '@pkg/database';

import { GetAnnouncementsContract } from './get-announcements.contract';
import { GetAnnouncementResponseDto } from './get-announcements.response.dto';

@QueryHandler(GetAnnouncementsContract)
export class GetAnnouncementsHandler implements IQueryHandler<GetAnnouncementsContract> {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: CoreRepository<Announcement>,
  ) {}

  async execute(query: GetAnnouncementsContract): Promise<GetAnnouncementResponseDto[]> {
    const announcements = await this.announcementRepository.find(
      this.buildAnnouncementsQueryFilter(query.data.status, query.data.isPublished),
      { orderBy: { createdAt: 'DESC' } },
    );

    return announcements.map((announcement) => new GetAnnouncementResponseDto(announcement));
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
