import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';

import { GetOrganizationsQueryDto, OrganizationActionDto, OrganizationResponseDto } from './dto';
import { OrganizationsClient } from './organizations.client';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsClient: OrganizationsClient) {}

  @Get()
  @CheckPermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: '조직 목록 조회', description: '조직 목록을 조회합니다.' })
  @SwaggerResult([OrganizationResponseDto])
  async getOrganizations(@Query() query: GetOrganizationsQueryDto) {
    const result = await this.organizationsClient.getOrganizations({ status: query.status });
    return ApiResponse.success(result, '조직 목록을 조회했습니다.');
  }

  @Post('approve')
  @CheckPermissions('ORGANIZATION:UPDATE')
  @ApiOperation({ summary: '조직 승인', description: '조직을 승인합니다.' })
  @SwaggerResult()
  async approveOrganization(@Body() body: OrganizationActionDto) {
    const result = await this.organizationsClient.approveOrganization(body.id, true);
    return ApiResponse.success(result, '조직을 승인했습니다.');
  }

  @Post('reject')
  @CheckPermissions('ORGANIZATION:UPDATE')
  @ApiOperation({ summary: '조직 거절', description: '조직을 거절합니다.' })
  @SwaggerResult()
  async rejectOrganization(@Body() body: OrganizationActionDto) {
    const result = await this.organizationsClient.approveOrganization(body.id, false);
    return ApiResponse.success(result, '조직을 거절했습니다.');
  }
}
