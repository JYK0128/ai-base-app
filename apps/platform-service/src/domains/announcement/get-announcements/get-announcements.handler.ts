import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, CoreRepository } from '@pkg/database';

import { GetAnnouncementsContract } from './get-announcements.contract';
import { GetAnnouncementResponseDto } from './get-announcements.response.dto';

@QueryHandler(GetAnnouncementsContract)
export class GetAnnouncementsHandler implements IQueryHandler<GetAnnouncementsContract> {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: CoreRepository<Announcement>,
  ) {}

  async execute(query: GetAnnouncementsContract): Promise<GetAnnouncementResponseDto[]> {
    const filter = query.data.isPublished
      ? { metadata: { publishedAt: { $ne: null } } }
      : {};

    const announcements = await this.announcementRepository.find(
      filter,
      { orderBy: { createdAt: 'DESC' } },
    );

    return announcements.map((announcement) => new GetAnnouncementResponseDto(announcement));
  }
}
