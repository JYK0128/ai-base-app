import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementRepository } from '@pkg/database';

export { GetAnnouncementsQuery } from './get-announcements.helpers';
import { GetAnnouncementsQuery } from './get-announcements.helpers';

@QueryHandler(GetAnnouncementsQuery)
export class GetAnnouncementsHandler implements IQueryHandler<GetAnnouncementsQuery> {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: AnnouncementRepository,
  ) {}

  async execute(query: GetAnnouncementsQuery): Promise<Announcement[]> {
    const filter = query.isPublishedOnly ? { isPublished: true } : {};
    return this.announcementRepo.find(filter, {
      populate: ['author'],
      orderBy: { createdAt: 'DESC' },
    });
  }
}
