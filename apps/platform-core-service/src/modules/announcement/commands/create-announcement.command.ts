import { Command } from '@nestjs/cqrs';

import type { CreateAnnouncementInput } from '../announcement.contract';
import type { AnnouncementOutputId } from '../announcement.types';

/**
 * 공지사항 생성 커맨드
 */
export class CreateAnnouncementCommand extends Command<AnnouncementOutputId> {
  constructor(readonly payload: CreateAnnouncementInput) {
    super();
  }
}
