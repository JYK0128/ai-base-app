import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetAnnouncementsContract } from './get-announcements/get-announcements.contract';
import { GetAnnouncementsRequestDto } from './get-announcements/get-announcements.request.dto';
import type { AnnouncementResponseDto } from './get-announcements/get-announcements.response.dto';

@Controller('announcements')
export class AnnouncementController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAnnouncements(
    @Query() query: GetAnnouncementsRequestDto,
  ): Promise<AnnouncementResponseDto[]> {
    return this.queryBus.execute(new GetAnnouncementsContract(query));
  }
}
