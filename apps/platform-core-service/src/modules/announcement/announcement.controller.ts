import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreateAnnouncementCommand } from './commands/create-announcement.handler';
import { GetAnnouncementsQuery } from './queries/get-announcements.handler';

@Controller()
export class AnnouncementController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern('announcements.get')
  async getAnnouncements(@Payload() data: { isPublishedOnly?: boolean }) {
    return this.queryBus.execute(new GetAnnouncementsQuery(data.isPublishedOnly));
  }

  @MessagePattern('announcements.create')
  async createAnnouncement(@Payload() data: { authorId: string, data: { title: string, content: string, isPublished?: boolean } }) {
    return this.commandBus.execute(
      new CreateAnnouncementCommand(
        data.authorId,
        data.data.title,
        data.data.content,
        data.data.isPublished,
      ),
    );
  }
}
