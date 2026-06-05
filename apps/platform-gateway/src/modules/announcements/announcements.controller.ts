import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';

import { AnnouncementsClient } from './announcements.client';
import { AnnouncementResponseDto, CreateAnnouncementDto, GetAnnouncementsQueryDto } from './dto';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsClient: AnnouncementsClient,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @CheckPermissions('ANNOUNCEMENT:READ')
  @ApiOperation({ summary: '공지사항 조회', description: '공지사항 목록을 조회합니다.' })
  @SwaggerResult([AnnouncementResponseDto])
  async getAnnouncements(@Query() query: GetAnnouncementsQueryDto) {
    const result = await this.announcementsClient.getAnnouncements({ isPublishedOnly: query.isPublishedOnly });
    return ApiResponse.success(result, '공지사항 목록을 조회했습니다.');
  }

  @Post()
  @CheckPermissions('ANNOUNCEMENT:CREATE')
  @ApiOperation({ summary: '공지사항 작성', description: '공지사항을 작성합니다.' })
  @SwaggerResult(AnnouncementResponseDto)
  async createAnnouncement(@Body() data: CreateAnnouncementDto) {
    const result = await this.announcementsClient.createAnnouncement(this.cls.get('memberId'), data);
    return ApiResponse.success(result, '공지사항을 작성했습니다.');
  }
}
