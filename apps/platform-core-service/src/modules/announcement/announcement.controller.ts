import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ANNOUNCEMENT_SERVICE_PATTERNS } from './announcement.constants';
import type { AnnouncementInput } from './announcement.types';
import { CreateAnnouncementCommand } from './commands';
import { GetAnnouncementsQuery } from './queries';

@Controller()
export class AnnouncementController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(ANNOUNCEMENT_SERVICE_PATTERNS.ANNOUNCEMENT.LIST)
  async getAnnouncements(@Payload() data: { isPublishedOnly?: boolean }) {
    return this.queryBus.execute(new GetAnnouncementsQuery(data.isPublishedOnly));
  }

  @MessagePattern(ANNOUNCEMENT_SERVICE_PATTERNS.ANNOUNCEMENT.CREATE)
  async createAnnouncement(@Payload() data: { memberId: string, data: AnnouncementInput }) {
    return this.commandBus.execute(
      new CreateAnnouncementCommand(data.memberId, data.data),
    );
  }
}
