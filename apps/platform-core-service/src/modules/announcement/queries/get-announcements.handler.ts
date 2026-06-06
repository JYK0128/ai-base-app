import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementRepository } from '@pkg/database';

import { buildAnnouncementRecord } from '../announcement.mapper';
import type { AnnouncementRecord } from '../announcement.types';
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

  async execute(query: GetAnnouncementsQuery): Promise<AnnouncementRecord[]> {
    const announcements = await this.announcementRepo.find({}, {
      populate: ['author.accounts'],
      orderBy: { createdAt: 'DESC' },
    });

    const filteredAnnouncements = query.isPublishedOnly
      ? announcements.filter((announcement) => announcement.isPublished)
      : announcements;

    return filteredAnnouncements.map((announcement) => buildAnnouncementRecord(announcement));
  }
}
