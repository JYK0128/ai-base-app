import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementMetadata } from '@pkg/database';

import { CreateAnnouncementContract } from './create-announcement.contract';
import { CreateAnnouncementResponseDto } from './create-announcement.response.dto';

@CommandHandler(CreateAnnouncementContract)
export class CreateAnnouncementHandler implements ICommandHandler<CreateAnnouncementContract> {
  constructor(
  ) {}

  @Transactional()
  async execute({ data }: CreateAnnouncementContract): Promise<CreateAnnouncementResponseDto> {
    const metadata = new AnnouncementMetadata({
      category: data.category,
      channel: data.channel,
      audience: data.audience,
      priority: data.priority,
      pinned: data.pinned,
      publishedAt: data.publishedAt,
      startAt: data.startAt,
      endAt: data.endAt,
    });

    const announcement = Announcement.create({
      title: data.title.trim(),
      content: data.content.trim(),
      metadata,
    });

    return new CreateAnnouncementResponseDto(announcement.id);
  }
}
