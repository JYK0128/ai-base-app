import { Transactional } from '@mikro-orm/decorators/legacy';
import type { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement } from '@pkg/database';

import { DeleteAnnouncementCommand } from './delete-announcement.command';

/**
 * 공지사항 삭제 핸들러
 */
@CommandHandler(DeleteAnnouncementCommand)
export class DeleteAnnouncementHandler implements ICommandHandler<DeleteAnnouncementCommand> {
  constructor(
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute({ payload }: DeleteAnnouncementCommand): Promise<{ id: string }> {
    const announcement = await this.identifyAnnouncement(payload.announcementId);
    await this.processAnnouncementDeletion(announcement);

    return { id: announcement.id };
  }

  private async identifyAnnouncement(announcementId: string) {
    return Announcement.getReference(announcementId);
  }

  /**
   * STEP 1: 공지사항 삭제 처리
   */
  private async processAnnouncementDeletion(
    announcement: Announcement,
  ): Promise<void> {
    announcement.remove();
  }
}
