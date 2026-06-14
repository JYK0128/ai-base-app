import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { DeleteAnnouncementContract } from './delete-announcement/delete-announcement.contract';
import { DeleteAnnouncementRequestDto } from './delete-announcement/delete-announcement.request.dto';
import { GetAnnouncementsContract } from './get-announcements/get-announcements.contract';
import { GetAnnouncementsRequestDto } from './get-announcements/get-announcements.request.dto';
import { CreateAnnouncementResponseDto, DeleteAnnouncementResponseDto, GetAnnouncementResponseDto, UpdateAnnouncementResponseDto } from './get-announcements/get-announcements.response.dto';
import { CreateAnnouncementContract } from './save-announcement/save-announcement.contract';
import { CreateAnnouncementRequestDto } from './save-announcement/save-announcement.request.dto';
import { UpdateAnnouncementContract } from './update-announcement/update-announcement.contract';
import { UpdateAnnouncementRequestDto } from './update-announcement/update-announcement.request.dto';

@Controller('announcements')
export class AnnouncementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAnnouncements(
    @Query() query: GetAnnouncementsRequestDto,
  ): Promise<GetAnnouncementResponseDto[]> {
    return this.queryBus.execute(new GetAnnouncementsContract(query));
  }

  @Post()
  async createAnnouncement(
    @Body() body: CreateAnnouncementRequestDto,
  ): Promise<CreateAnnouncementResponseDto> {
    return this.commandBus.execute(new CreateAnnouncementContract(body));
  }

  @Put(':id')
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() body: UpdateAnnouncementRequestDto,
  ): Promise<UpdateAnnouncementResponseDto> {
    return this.commandBus.execute(new UpdateAnnouncementContract(id, body));
  }

  @Delete(':id')
  async deleteAnnouncement(
    @Param('id') id: string,
  ): Promise<DeleteAnnouncementResponseDto> {
    return this.commandBus.execute(new DeleteAnnouncementContract({ id } satisfies DeleteAnnouncementRequestDto));
  }
}
