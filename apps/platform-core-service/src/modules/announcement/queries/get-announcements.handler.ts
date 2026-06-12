import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, CoreRepository } from '@pkg/database';

import { AnnouncementRecord } from '../announcement.contract';
import { buildAnnouncementOutput } from '../announcement.helper';
import { GetAnnouncementsAsserter } from './get-announcements.error';
import { GetAnnouncementsQuery } from './get-announcements.query';

/**
 * 공지사항 목록 조회 핸들러
 */
@QueryHandler(GetAnnouncementsQuery)
export class GetAnnouncementsHandler implements IQueryHandler<GetAnnouncementsQuery> {
  private readonly Asserter = GetAnnouncementsAsserter;

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: CoreRepository<Announcement>,
  ) {}

  async execute({ payload }: GetAnnouncementsQuery): Promise<AnnouncementRecord[]> {
    const announcements = await this.announcementRepo.find({
      isPublished: payload.isPublishedOnly ? true : undefined,
    }, {
      orderBy: { createdAt: 'DESC' },
    });

    return announcements.map(buildAnnouncementOutput);
  }
}
