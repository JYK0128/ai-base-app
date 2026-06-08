import { Command } from '@nestjs/cqrs';

import type { DeleteAnnouncementInput } from '../announcement.contract';

/**
 * 공지사항 삭제 커맨드
 */
export class DeleteAnnouncementCommand extends Command<{ id: string }> {
  constructor(readonly payload: DeleteAnnouncementInput) {
    super();
  }
}
