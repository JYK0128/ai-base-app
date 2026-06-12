import { Announcement } from '@pkg/database';

import { InsertCommand } from '../../../../../platform-service/src/common/interfaces/contract';
import type { CreateAnnouncementInput } from '../announcement.contract';

/**
 * 공지사항 생성 커맨드
 */
export class CreateAnnouncementCommand extends InsertCommand<Announcement> {
  constructor(readonly payload: CreateAnnouncementInput) {
    super(payload.data);
  }
}
