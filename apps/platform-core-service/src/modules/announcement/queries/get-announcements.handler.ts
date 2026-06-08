import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementRepository } from '@pkg/database';

import { buildAnnouncementOutput } from '../announcement.helper';
import type { AnnouncementOutput } from '../announcement.types';
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
    private readonly announcementRepo: AnnouncementRepository,
  ) {}

  async execute({ payload }: GetAnnouncementsQuery): Promise<AnnouncementOutput[]> {
    const announcements = await this.announcementRepo.find({
      isPublished: payload.isPublishedOnly ? true : undefined,
    }, {
      orderBy: { createdAt: 'DESC' },
    });

    return announcements.map(buildAnnouncementOutput);
  }
}
