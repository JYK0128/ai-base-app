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
  async execute({ data }: DeleteAnnouncementContract): Promise<DeleteAnnouncementResponseDto> {
    const announcement = Announcement.getReference(data.id);
    announcement.remove();

    return new DeleteAnnouncementResponseDto(announcement.id);
  }
}
