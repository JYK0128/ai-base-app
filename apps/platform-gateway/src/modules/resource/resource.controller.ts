import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JWTPayload } from 'jose';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';

import { CreatePermissionSetDto,
         CreateResourceDto,
         CreateResourceResponseDto,
         DeleteResourceBodyDto,
         DeleteResourceResponseDto,
         GetResourcesQueryDto,
         PermissionSetResponseDto,
         ResourceDetailResponseDto,
         ResourceResponseDto,
         UpdatePermissionSetPermissionsDto,
         UpdateResourceDetailBodyDto,
         UpdateResourcePermissionsDto,
         UpdateResourceSortDto } from './dto/resource.dto';
import { ResourceClient } from './resource.client';

@ApiTags('Resource')
@ApiBearerAuth()
@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceClient: ResourceClient) { }

  @Get()
  @CheckPermissions('RESOURCE:READ')
  @ApiOperation({
    summary: '리소스 목록 조회',
    description: '플랫폼 리소스 트리를 조회합니다.',
  })
  @SwaggerResult([ResourceResponseDto])
  async getResources(
    @Query() query: GetResourcesQueryDto,
  ) {
    const result = await this.resourceClient.getResources(query.scope);
    return ApiResponse.success(result, '리소스 목록을 조회했습니다.');
  }

  @Get('my-resources')
  @ApiOperation({
    summary: '내 리소스 목록 조회',
    description: '내 허용 리소스를 조회합니다.',
  })
  @SwaggerResult([ResourceResponseDto])
  async getMyResources(
    @CurrentUser() user: JWTPayload,
    // @Query() query: ResourceQueryDto,
  ) {
    const result = await this.resourceClient.getMyResources(user.permissions ?? []);
    return ApiResponse.success(result, '내 허용 리소스 목록을 조회했습니다.');
  }

  @Get('permission-sets')
  @CheckPermissions('PERMISSION:READ')
  @ApiOperation({
    summary: '권한 세트 목록 조회',
    description: '조직의 권한 세트 목록을 조회합니다.',
  })
  @SwaggerResult([PermissionSetResponseDto])
  async getPermissionSets() {
    const result = await this.resourceClient.getPermissionSets();
    return ApiResponse.success(result, '권한 세트 목록을 조회했습니다.');
  }

  @Get(':id')
  @CheckPermissions('RESOURCE:READ')
  @ApiOperation({
    summary: '리소스 조회',
    description: '리소스 상세를 조회합니다.',
  })
  @SwaggerResult(ResourceDetailResponseDto)
  async getResource(@Param('id') id: string) {
    const result = await this.resourceClient.getResource(id);
    return ApiResponse.success(result, '리소스 상세를 조회했습니다.');
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

  @Post('permission-sets')
  @CheckPermissions('PERMISSION:CREATE')
  @ApiOperation({
    summary: '권한 세트 생성',
    description: '조직의 권한 세트를 생성합니다.',
  })
  @SwaggerResult(PermissionSetResponseDto)
  async createPermissionSet(@Body() dto: CreatePermissionSetDto) {
    const result = await this.resourceClient.createPermissionSet(dto);
    return ApiResponse.success(result, '권한 세트를 생성했습니다.');
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

  @Post('permission-sets/update-permissions')
  @CheckPermissions('PERMISSION:UPDATE')
  @ApiOperation({
    summary: '권한 세트 퍼미션 수정',
    description: '권한 세트의 퍼미션을 수정합니다.',
  })
  @SwaggerResult(PermissionSetResponseDto)
  async updatePermissionSetPermissions(
    @Body() dto: UpdatePermissionSetPermissionsDto,
  ) {
    const result = await this.resourceClient.updatePermissionSetPermissions(dto);
    return ApiResponse.success(result, '권한 세트 퍼미션을 수정했습니다.');
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
