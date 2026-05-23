import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import type { JWTPayload } from '@/common/types/request.type';
import { ApiResponse } from '@/common/types/response.type';

import {
  CreateResourceDto,
  CreateResourceResponseDto,
  DeleteResourceBodyDto,
  DeleteResourceResponseDto,
  ResourceDetailResponseDto,
  ResourceResponseDto,
  UpdateResourceDetailBodyDto,
  UpdateResourcePermissionsDto,
  UpdateResourceSortDto,
} from './dto/resource.dto';
import { ResourceClient } from './resource.client';

@ApiTags('Resource')
@ApiBearerAuth()
@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceClient: ResourceClient) { }

  @Get()
  @CheckPermissions('RESOURCE:READ')
  @ApiOperation({
    summary: '자원 목록 조회',
    description: '자원 트리를 조회합니다.',
  })
  @SwaggerResult([ResourceResponseDto])
  async getResources(
    // @Query() query: ResourceQueryDto
  ) {
    const result = await this.resourceClient.getResources();
    return ApiResponse.success(result, '자원 목록을 조회했습니다.');
  }

  @Get('my-resources')
  @ApiOperation({
    summary: '내 자원 목록 조회',
    description: '내 허용 자원을 조회합니다.',
  })
  @SwaggerResult([ResourceResponseDto])
  async getMyResources(
    @CurrentUser() user: JWTPayload,
    // @Query() query: ResourceQueryDto,
  ) {
    const result = await this.resourceClient.getMyResources(user.permissions ?? [], user.roles ?? []);
    return ApiResponse.success(result, '내 허용 자원 목록을 조회했습니다.');
  }

  @Get(':id')
  @CheckPermissions('RESOURCE:READ')
  @ApiOperation({
    summary: '자원 조회',
    description: '자원 상세를 조회합니다.',
  })
  @SwaggerResult(ResourceDetailResponseDto)
  async getResource(@Param('id') id: string) {
    const result = await this.resourceClient.getResource(id);
    return ApiResponse.success(result, '자원 상세를 조회했습니다.');
  }

  @Post('create')
  @CheckPermissions('RESOURCE:CREATE')
  @ApiOperation({
    summary: '리소스 생성',
    description: '리소스를 생성합니다.',
  })
  @SwaggerResult(CreateResourceResponseDto)
  async createResource(@Body() dto: CreateResourceDto) {
    const result = await this.resourceClient.createResource(dto);
    return ApiResponse.success(result, '리소스가 성공적으로 생성되었습니다.');
  }

  @Post('update')
  @CheckPermissions('RESOURCE:UPDATE')
  @ApiOperation({
    summary: '리소스 수정',
    description: '리소스를 수정합니다.',
  })
  @SwaggerResult(CreateResourceResponseDto)
  async updateResource(@Body() dto: UpdateResourceDetailBodyDto) {
    const result = await this.resourceClient.updateResourceDetail(dto);
    return ApiResponse.success(result, '리소스 상세정보를 수정했습니다.');
  }

  @Post('update-permissions')
  @CheckPermissions('RESOURCE:UPDATE')
  @ApiOperation({
    summary: '리소스 권한 수정',
    description: '리소스 권한을 수정합니다.',
  })
  @SwaggerResult(CreateResourceResponseDto)
  async updateResourcePermissions(
    @Body() dto: UpdateResourcePermissionsDto,
  ) {
    const result = await this.resourceClient.updateResourcePermissions(dto);
    return ApiResponse.success(result, '리소스 권한 정보를 수정했습니다.');
  }

  @Post('update-sort')
  @CheckPermissions('RESOURCE:UPDATE')
  @ApiOperation({
    summary: '리소스 순서 수정',
    description: '리소스 순서를 수정합니다.',
  })
  @SwaggerResult(CreateResourceResponseDto)
  async updateResourceSort(
    @Body() dto: UpdateResourceSortDto,
  ) {
    const result = await this.resourceClient.updateResourceSort(dto);
    return ApiResponse.success(result, '리소스 정렬 순서를 수정했습니다.');
  }

  @Post('delete')
  @CheckPermissions('RESOURCE:DELETE')
  @ApiOperation({
    summary: '리소스 삭제',
    description: '리소스를 삭제합니다.',
  })
  @SwaggerResult(DeleteResourceResponseDto)
  async deleteResource(@Body() dto: DeleteResourceBodyDto) {
    const result = await this.resourceClient.deleteResource(dto.id);
    return ApiResponse.success(result, '리소스를 삭제했습니다.');
  }
}
