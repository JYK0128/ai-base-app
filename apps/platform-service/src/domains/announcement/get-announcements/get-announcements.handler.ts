import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, CoreRepository } from '@pkg/database';

import { GetAnnouncementsContract } from './get-announcements.contract';
import type { AnnouncementResponseDto } from './get-announcements.response.dto';

@QueryHandler(GetAnnouncementsContract)
export class GetAnnouncementsHandler implements IQueryHandler<GetAnnouncementsContract> {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: CoreRepository<Announcement>,
  ) {}

  async execute(query: GetAnnouncementsContract): Promise<AnnouncementResponseDto[]> {
    const announcements = await this.announcementRepository.find(
      { isPublished: query.data.isPublishedOnly ? true : undefined },
      { orderBy: { createdAt: 'DESC' } },
    );

    return announcements.map((announcement) => new AnnouncementResponseDto(announcement));
  }
}
