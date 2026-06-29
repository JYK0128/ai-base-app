import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Announcement } from '@pkg/database';

import { DeleteAnnouncementContract } from './delete-announcement.contract';
import { DeleteAnnouncementResponseDto } from './delete-announcement.response.dto';

@CommandHandler(DeleteAnnouncementContract)
export class DeleteAnnouncementHandler implements ICommandHandler<DeleteAnnouncementContract> {
  constructor(
  ) {}

  @Transactional()
  async execute(command: DeleteAnnouncementContract): Promise<DeleteAnnouncementResponseDto> {
    const announcement = this.identifyAnnouncement(command);
    this.verifyDeletion(announcement);
    this.processDelete(announcement);

    return new DeleteAnnouncementResponseDto(announcement.id);
  }

  private identifyAnnouncement(command: DeleteAnnouncementContract): Announcement {
    const announcement = Announcement.getReference(command.data.id);
    return announcement;
  }

  private verifyDeletion(_announcement: Announcement): void {
    // 공지 삭제 정책 검증 영역
  }

  private processDelete(announcement: Announcement): void {
    announcement.remove();
  }
}
