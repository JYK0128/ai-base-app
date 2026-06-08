import { Command } from '@nestjs/cqrs';

import type { UpdateAnnouncementInput } from '../announcement.contract';
import type { AnnouncementIdRecord } from '../announcement.types';

/**
 * 공지사항 수정 커맨드
 */
export class UpdateAnnouncementCommand extends Command<AnnouncementIdRecord> {
  constructor(readonly payload: UpdateAnnouncementInput) {
    super();
  }
}
