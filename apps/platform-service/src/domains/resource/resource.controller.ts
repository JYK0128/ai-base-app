import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { GetResourceContract } from './get-resource/get-resource.contract';
import { GetResourceResponseDto } from './get-resource/get-resource.response.dto';
import { GetResourceListContract } from './get-resource-list/get-resource-list.contract';
import { GetResourceListRequestDto } from './get-resource-list/get-resource-list.request.dto';
import { GetResourceListResponseDto } from './get-resource-list/get-resource-list.response.dto';
import { GetRolePermissionListContract } from './get-role-permission-list/get-role-permission-list.contract';
import { GetRolePermissionListResponseDto } from './get-role-permission-list/get-role-permission-list.response.dto';

@Controller('resources')
export class ResourceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('permission-sets')
  @SwaggerResponse(GetRolePermissionListResponseDto)
  async getRolePermissionList(): Promise<GetRolePermissionListResponseDto> {
    return this.queryBus.execute(new GetRolePermissionListContract());
  }

  @Get(':id')
  @SwaggerResponse(GetResourceResponseDto)
  async getResource(
    @Param('id') id: string,
  ): Promise<GetResourceResponseDto> {
    return this.queryBus.execute(new GetResourceContract({ id }));
  }

  @Get()
  @SwaggerResponse(GetResourceListResponseDto)
  async getResourceList(
    @Query() query: GetResourceListRequestDto,
  ): Promise<GetResourceListResponseDto> {
    return this.queryBus.execute(new GetResourceListContract(query));
  }
}
