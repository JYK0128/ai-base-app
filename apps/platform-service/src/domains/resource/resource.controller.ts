import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetPermissionSetsContract } from './permission-sets/get-permission-sets.contract';
import { GetPermissionSetResponseDto } from './permission-sets/get-permission-sets.response.dto';
import { GetResourceContract } from './queries/get-resource.contract';
import { GetResourceResponseDto } from './queries/get-resource.response.dto';
import { GetResourcesContract } from './queries/get-resources.contract';
import { GetResourcesRequestDto } from './queries/get-resources.request.dto';
import { GetResourceResponseDto as GetResourcesItemResponseDto } from './queries/get-resources.response.dto';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('permission-sets')
  async getPermissionSets(): Promise<GetPermissionSetResponseDto[]> {
    return this.queryBus.execute(new GetPermissionSetsContract());
  }

  @Get(':id')
  async getResource(
    @Param('id') id: string,
  ): Promise<GetResourceResponseDto> {
    return this.queryBus.execute(new GetResourceContract({ id }));
  }

  @Get()
  async getResources(
    @Query() query: GetResourcesRequestDto,
  ): Promise<GetResourcesItemResponseDto[]> {
    return this.queryBus.execute(new GetResourcesContract(query));
  }
}
