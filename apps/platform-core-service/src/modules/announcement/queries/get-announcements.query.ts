import { Query } from '@nestjs/cqrs';

import type { AnnouncementRecord, GetAnnouncementsInput } from '../announcement.contract';

/**
 * 공지사항 목록 조회 쿼리
 */
export class GetAnnouncementsQuery extends Query<AnnouncementRecord[]> {
  constructor(readonly payload: GetAnnouncementsInput) {
    super();
  }
}
