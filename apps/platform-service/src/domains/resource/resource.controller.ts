import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetPermissionSetsContract } from './permission-sets/get-permission-sets.contract';
import type { PermissionSetResponseDto } from './permission-sets/get-permission-sets.response.dto';
import { GetResourceContract } from './queries/get-resource.contract';
import type { ResourceDetailResponseDto } from './queries/get-resource.response.dto';
import { GetResourcesContract } from './queries/get-resources.contract';
import type { GetResourcesRequestDto } from './queries/get-resources.request.dto';
import type { ResourceResponseDto } from './queries/get-resources.response.dto';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('permission-sets')
  async getPermissionSets(): Promise<PermissionSetResponseDto[]> {
    return this.queryBus.execute(new GetPermissionSetsContract());
  }

  @Get(':id')
  async getResource(
    @Param('id') id: string,
  ): Promise<ResourceDetailResponseDto> {
    return this.queryBus.execute(new GetResourceContract({ id }));
  }

  @Get()
  async getResources(
    @Query() query: GetResourcesRequestDto,
  ): Promise<ResourceResponseDto[]> {
    return this.queryBus.execute(new GetResourcesContract(query));
  }
}
