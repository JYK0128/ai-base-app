import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { DeleteAnnouncementContract } from './delete-announcement/delete-announcement.contract';
import { GetAnnouncementsContract } from './get-announcements/get-announcements.contract';
import { GetAnnouncementsRequestDto } from './get-announcements/get-announcements.request.dto';
import { AnnouncementResponseDto } from './get-announcements/get-announcements.response.dto';
import { SaveAnnouncementContract } from './save-announcement/save-announcement.contract';
import { SaveAnnouncementRequestDto } from './save-announcement/save-announcement.request.dto';

@Controller('announcements')
export class AnnouncementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAnnouncements(
    @Query() query: GetAnnouncementsRequestDto,
  ): Promise<AnnouncementResponseDto[]> {
    return this.queryBus.execute(new GetAnnouncementsContract(query));
  }

  @Post()
  async createAnnouncement(
    @Body() body: SaveAnnouncementRequestDto,
  ): Promise<AnnouncementResponseDto> {
    return this.commandBus.execute(new SaveAnnouncementContract(body));
  }

  @Put(':id')
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() body: SaveAnnouncementRequestDto,
  ): Promise<AnnouncementResponseDto> {
    return this.commandBus.execute(new SaveAnnouncementContract({
      ...body,
      id,
    }));
  }

  @Delete(':id')
  async deleteAnnouncement(
    @Param('id') id: string,
  ): Promise<AnnouncementResponseDto> {
    return this.commandBus.execute(new DeleteAnnouncementContract({ id }));
  }
}
