import { Query } from '@nestjs/cqrs';

import type { GetAnnouncementsInput } from '../announcement.contract';
import type { AnnouncementOutput } from '../announcement.types';

/**
 * 공지사항 목록 조회 쿼리
 */
export class GetAnnouncementsQuery extends Query<AnnouncementOutput[]> {
  constructor(readonly payload: GetAnnouncementsInput) {
    super();
  }
}
