import { Command } from '@nestjs/cqrs';

import type { AnnouncementIdRecord, CreateAnnouncementInput } from '../announcement.contract';

/**
 * 공지사항 생성 커맨드
 */
export class CreateAnnouncementCommand extends Command<AnnouncementIdRecord> {
  constructor(readonly payload: CreateAnnouncementInput) {
    super();
  }
}
