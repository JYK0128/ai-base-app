import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetPermissionSetsContract } from './get-permission-sets/get-permission-sets.contract';
import { GetPermissionSetResponseDto } from './get-permission-sets/get-permission-sets.response.dto';
import { GetResourceContract } from './get-resource/get-resource.contract';
import { GetResourceResponseDto } from './get-resource/get-resource.response.dto';
import { GetResourcePageContract } from './get-resource-page/get-resource-page.contract';
import { GetResourcePageRequestDto } from './get-resource-page/get-resource-page.request.dto';
import { GetResourceResponseDto as GetResourcePageItemResponseDto } from './get-resource-page/get-resource-page.response.dto';

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
  async getResourcePage(
    @Query() query: GetResourcePageRequestDto,
  ): Promise<GetResourcePageItemResponseDto[]> {
    return this.queryBus.execute(new GetResourcePageContract(query));
  }
}
