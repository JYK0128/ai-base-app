import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
    const result = await this.announcementsClient.createAnnouncement(data);
    return ApiResponse.success(result, '공지사항을 작성했습니다.');
  }

  @Put(':id')
  @CheckPermissions('ANNOUNCEMENT:UPDATE')
  @ApiOperation({ summary: '공지사항 수정', description: '공지사항을 수정합니다.' })
  @SwaggerResult(AnnouncementResponseDto)
  async updateAnnouncement(@Param('id') id: string, @Body() data: CreateAnnouncementDto) {
    const result = await this.announcementsClient.updateAnnouncement(id, data);
    return ApiResponse.success(result, '공지사항을 수정했습니다.');
  }

  @Delete(':id')
  @CheckPermissions('ANNOUNCEMENT:DELETE')
  @ApiOperation({ summary: '공지사항 삭제', description: '공지사항을 삭제합니다.' })
  @SwaggerResult(AnnouncementResponseDto)
  async deleteAnnouncement(@Param('id') id: string) {
    const result = await this.announcementsClient.deleteAnnouncement(id);
    return ApiResponse.success(result, '공지사항을 삭제했습니다.');
  }
}
