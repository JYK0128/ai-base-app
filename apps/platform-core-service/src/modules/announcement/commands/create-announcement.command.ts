import { Command } from '@nestjs/cqrs';

import type { CreateAnnouncementInput } from '../announcement.contract';
import type { AnnouncementIdRecord } from '../announcement.types';

/**
 * 공지사항 생성 커맨드
 */
export class CreateAnnouncementCommand extends Command<AnnouncementIdRecord> {
  constructor(readonly payload: CreateAnnouncementInput) {
    super();
  }
}
