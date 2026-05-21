import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import type { JWTPayload } from '@/common/types/request.type';
import { ApiResponse } from '@/common/types/response.type';

import { CreateResourcesDto, CreateResourcesResponseDto, ResourceResponseDto } from './dto/resource.dto';
import { ResourceClient } from './resource.client';

@ApiTags('Resource')
@ApiBearerAuth()
@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceClient: ResourceClient) { }

  @Get('resources')
  @CheckPermissions('RESOURCE:READ')
  @ApiOperation({
    summary: '자원 트리 구조 전체 조회',
    description: '시스템 내의 메뉴 및 API 자원들의 전체 계층 트리 구조를 조회합니다. 관리자 권한(RESOURCE:READ)이 필요합니다.',
  })
  @SwaggerResult([ResourceResponseDto])
  async getResources() {
    return this.resourceClient.getResources();
  }

  @Get('my-resources')
  @ApiOperation({
    summary: '내 허용 자원 트리 구조 조회',
    description: '현재 로그인한 유저가 권한을 가진 자원들로만 필터링된 계층 트리 구조를 조회합니다.',
  })
  @SwaggerResult([ResourceResponseDto])
  async getMyResources(@CurrentUser() user: JWTPayload) {
    return this.resourceClient.getMyResources(user.permissions ?? [], user.roles ?? []);
  }

  @Post('resources/batch')
  @CheckPermissions('RESOURCE:CREATE')
  @ApiOperation({
    summary: '리소스 일괄 생성',
    description: '새로운 메뉴 또는 컴포넌트 리소스를 한 번에 여러 개 생성합니다. 관리자 권한(RESOURCE:CREATE)이 필요합니다.',
  })
  @SwaggerResult(CreateResourcesResponseDto)
  async createResources(@Body() dto: CreateResourcesDto) {
    const result = await this.resourceClient.createResources(dto.items);
    return ApiResponse.success(result, '리소스가 성공적으로 생성되었습니다.');
  }
}
