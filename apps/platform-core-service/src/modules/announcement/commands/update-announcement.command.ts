import { Command } from '@nestjs/cqrs';

import type { AnnouncementIdRecord, UpdateAnnouncementInput } from '../announcement.contract';

/**
 * 공지사항 수정 커맨드
 */
export class UpdateAnnouncementCommand extends Command<AnnouncementIdRecord> {
  constructor(readonly payload: UpdateAnnouncementInput) {
    super();
  }
}
