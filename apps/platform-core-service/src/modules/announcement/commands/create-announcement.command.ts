import { Command } from '@nestjs/cqrs';

import type { CreateAnnouncementInput } from '../announcement.contract';
import type { AnnouncementOutput } from '../announcement.types';

/**
 * 공지사항 생성 커맨드
 */
export class CreateAnnouncementCommand extends Command<AnnouncementOutput> {
  constructor(readonly payload: CreateAnnouncementInput) {
    super();
  }
}
