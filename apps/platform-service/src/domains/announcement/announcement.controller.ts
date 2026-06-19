import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { CreateAnnouncementContract } from './create-announcement/create-announcement.contract';
import { CreateAnnouncementRequestDto } from './create-announcement/create-announcement.request.dto';
import { CreateAnnouncementResponseDto } from './create-announcement/create-announcement.response.dto';
import { DeleteAnnouncementContract } from './delete-announcement/delete-announcement.contract';
import { DeleteAnnouncementRequestDto } from './delete-announcement/delete-announcement.request.dto';
import { DeleteAnnouncementResponseDto } from './delete-announcement/delete-announcement.response.dto';
import { GetAnnouncementContract } from './get-announcement/get-announcement.contract';
import { GetAnnouncementRequestDto } from './get-announcement/get-announcement.request.dto';
import { GetAnnouncementResponseDto } from './get-announcement/get-announcement.response.dto';
import { GetAnnouncementPageContract } from './get-announcement-page/get-announcement-page.contract';
import { GetAnnouncementPageRequestDto } from './get-announcement-page/get-announcement-page.request.dto';
import { GetAnnouncementPageResponseDto } from './get-announcement-page/get-announcement-page.response.dto';
import { UpdateAnnouncementContract } from './update-announcement/update-announcement.contract';
import { UpdateAnnouncementRequestDto } from './update-announcement/update-announcement.request.dto';
import { UpdateAnnouncementResponseDto } from './update-announcement/update-announcement.response.dto';

@Controller('announcements')
export class AnnouncementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @SwaggerResponse(GetAnnouncementPageResponseDto)
  async getAnnouncementPage(
    @Query() query: GetAnnouncementPageRequestDto,
  ): Promise<GetAnnouncementPageResponseDto> {
    return this.queryBus.execute(new GetAnnouncementPageContract(query));
  }

  @Get(':id')
  @SwaggerResponse(GetAnnouncementResponseDto)
  async getAnnouncement(
    @Param('id') id: string,
  ): Promise<GetAnnouncementResponseDto> {
    return this.queryBus.execute(new GetAnnouncementContract({ id } satisfies GetAnnouncementRequestDto));
  }

  @Post()
  @SwaggerResponse(CreateAnnouncementResponseDto)
  async createAnnouncement(
    @Body() body: CreateAnnouncementRequestDto,
  ): Promise<CreateAnnouncementResponseDto> {
    return this.commandBus.execute(new CreateAnnouncementContract(body));
  }

  @Put(':id')
  @SwaggerResponse(UpdateAnnouncementResponseDto)
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() body: UpdateAnnouncementRequestDto,
  ): Promise<UpdateAnnouncementResponseDto> {
    body.id = id;
    return this.commandBus.execute(new UpdateAnnouncementContract(body));
  }

  @Delete(':id')
  @SwaggerResponse(DeleteAnnouncementResponseDto)
  async deleteAnnouncement(
    @Param('id') id: string,
  ): Promise<DeleteAnnouncementResponseDto> {
    return this.commandBus.execute(new DeleteAnnouncementContract({ id } satisfies DeleteAnnouncementRequestDto));
  }
}
