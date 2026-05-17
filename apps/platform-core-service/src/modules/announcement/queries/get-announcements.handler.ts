import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementRepository } from '@pkg/database';

import { GetAnnouncementsAsserter, GetAnnouncementsQuery } from './get-announcements.helpers';

/**
 * 공지사항 목록 조회 핸들러
 */
@QueryHandler(GetAnnouncementsQuery)
export class GetAnnouncementsHandler implements IQueryHandler<GetAnnouncementsQuery> {
  private readonly Asserter = GetAnnouncementsAsserter;

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
