import { Command } from '@nestjs/cqrs';

import type { UpdateAnnouncementInput } from '../announcement.contract';
import type { AnnouncementOutputId } from '../announcement.types';

/**
 * 공지사항 수정 커맨드
 */
export class UpdateAnnouncementCommand extends Command<AnnouncementOutputId> {
  constructor(readonly payload: UpdateAnnouncementInput) {
    super();
  }
}
