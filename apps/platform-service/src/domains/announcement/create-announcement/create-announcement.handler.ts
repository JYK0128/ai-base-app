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
  async execute(command: CreateAnnouncementContract): Promise<CreateAnnouncementResponseDto> {
    const metadata = this.identifyMetadata(command);
    this.verifyCreation(command);
    const announcement = this.processCreation(command, metadata);

    return new CreateAnnouncementResponseDto(announcement.id);
  }

  private identifyMetadata(command: CreateAnnouncementContract): AnnouncementMetadata {
    return new AnnouncementMetadata({
      category: command.data.category,
      channel: command.data.channel,
      audience: command.data.audience,
      priority: command.data.priority,
      pinned: command.data.pinned,
      publishedAt: command.data.publishedAt,
      startAt: command.data.startAt,
      endAt: command.data.endAt,
    });
  }

  private verifyCreation(_command: CreateAnnouncementContract): void {
    // 공지 생성 정책 검증 영역
  }

  private processCreation(
    command: CreateAnnouncementContract,
    metadata: AnnouncementMetadata,
  ): Announcement {
    return Announcement.create({
      title: command.data.title.trim(),
      content: command.data.content.trim(),
      metadata,
    });
  }
}
