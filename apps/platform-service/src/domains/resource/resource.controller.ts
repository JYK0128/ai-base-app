import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { CreateResourceContract } from './create-resource/create-resource.contract';
import { CreateResourceRequestDto } from './create-resource/create-resource.request.dto';
import { CreateResourceResponseDto } from './create-resource/create-resource.response.dto';
import { DeleteResourceContract } from './delete-resource/delete-resource.contract';
import { DeleteResourceRequestDto } from './delete-resource/delete-resource.request.dto';
import { DeleteResourceResponseDto } from './delete-resource/delete-resource.response.dto';
import { GetPermissionMapListContract } from './get-permission-map-list/get-permission-map-list.contract';
import { GetResourceContract } from './get-resource/get-resource.contract';
import { GetResourceResponseDto } from './get-resource/get-resource.response.dto';
import { GetResourceListContract } from './get-resource-list/get-resource-list.contract';
import { GetResourceListRequestDto } from './get-resource-list/get-resource-list.request.dto';
import { GetResourceListResponseDto } from './get-resource-list/get-resource-list.response.dto';
import { GetRolePermissionListContract } from './get-role-permission-list/get-role-permission-list.contract';
import { GetRolePermissionListResponseDto } from './get-role-permission-list/get-role-permission-list.response.dto';
import { UpdatePermissionSetPermissionsContract } from './update-permission-set-permissions/update-permission-set-permissions.contract';
import { UpdatePermissionSetPermissionsRequestDto } from './update-permission-set-permissions/update-permission-set-permissions.request.dto';
import { UpdatePermissionSetPermissionsResponseDto } from './update-permission-set-permissions/update-permission-set-permissions.response.dto';
import { UpdateResourceContract } from './update-resource/update-resource.contract';
import { UpdateResourceRequestDto } from './update-resource/update-resource.request.dto';
import { UpdateResourceResponseDto } from './update-resource/update-resource.response.dto';
import { UpdateResourceSortContract } from './update-resource-sort/update-resource-sort.contract';
import { UpdateResourceSortRequestDto } from './update-resource-sort/update-resource-sort.request.dto';
import { UpdateResourceSortResponseDto } from './update-resource-sort/update-resource-sort.response.dto';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('create')
  @SwaggerResponse(CreateResourceResponseDto)
  async createResource(
    @Body() body: CreateResourceRequestDto,
  ): Promise<CreateResourceResponseDto> {
    return this.commandBus.execute(new CreateResourceContract(body));
  }

  @Post('update')
  @SwaggerResponse(UpdateResourceResponseDto)
  async updateResource(
    @Body() body: UpdateResourceRequestDto,
  ): Promise<UpdateResourceResponseDto> {
    return this.commandBus.execute(new UpdateResourceContract(body));
  }

  @Post('delete')
  @SwaggerResponse(DeleteResourceResponseDto)
  async deleteResource(
    @Body() body: DeleteResourceRequestDto,
  ): Promise<DeleteResourceResponseDto> {
    return this.commandBus.execute(new DeleteResourceContract(body));
  }

  @Post('update-sort')
  @SwaggerResponse(UpdateResourceSortResponseDto)
  async updateResourceSort(
    @Body() body: UpdateResourceSortRequestDto,
  ): Promise<UpdateResourceSortResponseDto> {
    return this.commandBus.execute(new UpdateResourceSortContract(body));
  }

  @Post('permission-sets/update-permissions')
  @SwaggerResponse(UpdatePermissionSetPermissionsResponseDto)
  async updatePermissionSetPermissions(
    @Body() body: UpdatePermissionSetPermissionsRequestDto,
  ): Promise<UpdatePermissionSetPermissionsResponseDto> {
    return this.commandBus.execute(new UpdatePermissionSetPermissionsContract(body));
  }

  @Get('permission-sets')
  @SwaggerResponse(GetRolePermissionListResponseDto)
  async getRolePermissionList(): Promise<GetRolePermissionListResponseDto> {
    return this.queryBus.execute(new GetRolePermissionListContract());
  }

  @Get('permission-sets/map')
  @SwaggerResponse(GetResourceListResponseDto)
  async getPermissionMap(): Promise<GetResourceListResponseDto> {
    return this.queryBus.execute(new GetPermissionMapListContract());
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
