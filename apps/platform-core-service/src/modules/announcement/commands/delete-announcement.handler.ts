import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement } from '@pkg/database';

import { DeleteAnnouncementCommand } from './delete-announcement.command';
import { DeleteAnnouncementAsserter } from './delete-announcement.error';

/**
 * 공지사항 삭제 핸들러
 */
@CommandHandler(DeleteAnnouncementCommand)
export class DeleteAnnouncementHandler implements ICommandHandler<DeleteAnnouncementCommand> {
  private readonly Asserter = DeleteAnnouncementAsserter;

  constructor(
  ) {}

  @Transactional()
  async execute({ payload }: DeleteAnnouncementCommand): Promise<{ id: string }> {
    return this.processAnnouncementDeletion(payload.announcementId);
  }

  /**
   * STEP 1: 공지사항 삭제 처리
   */
  private async processAnnouncementDeletion(
    announcementId: string,
  ): Promise<{ id: string }> {
    const target = Announcement.getReference(announcementId);
    target.remove();

    return { id: announcementId };
  }
}
