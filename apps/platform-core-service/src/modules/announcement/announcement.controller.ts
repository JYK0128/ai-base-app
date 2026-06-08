import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import type { CreateAnnouncementInput, DeleteAnnouncementInput, GetAnnouncementsInput, UpdateAnnouncementInput } from './announcement.contract';
import { ANNOUNCEMENT_SERVICE_PATTERNS } from './announcement.contract';
import { CreateAnnouncementCommand, DeleteAnnouncementCommand, UpdateAnnouncementCommand } from './commands';
import { GetAnnouncementsQuery } from './queries';

@Controller()
export class AnnouncementController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(ANNOUNCEMENT_SERVICE_PATTERNS.ANNOUNCEMENT.LIST)
  async getAnnouncements(@Payload() data: GetAnnouncementsInput) {
    return this.queryBus.execute(new GetAnnouncementsQuery(data));
  }

  @MessagePattern(ANNOUNCEMENT_SERVICE_PATTERNS.ANNOUNCEMENT.CREATE)
  async createAnnouncement(@Payload() data: CreateAnnouncementInput) {
    return this.commandBus.execute(
      new CreateAnnouncementCommand(data),
    );
  }

  @MessagePattern(ANNOUNCEMENT_SERVICE_PATTERNS.ANNOUNCEMENT.UPDATE)
  async updateAnnouncement(@Payload() data: UpdateAnnouncementInput) {
    return this.commandBus.execute(
      new UpdateAnnouncementCommand(data),
    );
  }

  @MessagePattern(ANNOUNCEMENT_SERVICE_PATTERNS.ANNOUNCEMENT.DELETE)
  async deleteAnnouncement(@Payload() data: DeleteAnnouncementInput) {
    return this.commandBus.execute(
      new DeleteAnnouncementCommand(data),
    );
  }
}
