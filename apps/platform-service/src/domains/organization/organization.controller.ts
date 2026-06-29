import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { ApproveOrganizationContract } from './approve-organization/approve-organization.contract';
import { ApproveOrganizationRequestDto } from './approve-organization/approve-organization.request.dto';
import { ApproveOrganizationResponseDto } from './approve-organization/approve-organization.response.dto';
import { GetOrganizationListContract } from './get-organization-list/get-organization-list.contract';
import { GetOrganizationListRequestDto } from './get-organization-list/get-organization-list.request.dto';
import { GetOrganizationListResponseDto } from './get-organization-list/get-organization-list.response.dto';
import { GetOrganizationRoleListContract } from './organization-role-list/get-organization-role-list.contract';
import { GetOrganizationRoleListResponseDto } from './organization-role-list/get-organization-role-list.response.dto';
import { UpdateOrganizationContract } from './update-organization/update-organization.contract';
import { UpdateOrganizationRequestDto } from './update-organization/update-organization.request.dto';
import { UpdateOrganizationResponseDto } from './update-organization/update-organization.response.dto';

@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @SwaggerResponse(GetOrganizationListResponseDto)
  async getOrganizationList(
    @Query() query: GetOrganizationListRequestDto,
  ): Promise<GetOrganizationListResponseDto> {
    return this.queryBus.execute(new GetOrganizationListContract(query));
  }

  @Get('roles')
  @SwaggerResponse(GetOrganizationRoleListResponseDto)
  async getOrganizationRoleList(): Promise<GetOrganizationRoleListResponseDto> {
    return this.queryBus.execute(new GetOrganizationRoleListContract());
  }

  @Patch(':id/approve')
  @SwaggerResponse(ApproveOrganizationResponseDto)
  async approveOrganization(
    @Param('id') id: string,
    @Body() body: ApproveOrganizationRequestDto,
  ): Promise<ApproveOrganizationResponseDto> {
    return this.commandBus.execute(new ApproveOrganizationContract({
      id,
      approve: body.approve,
    } satisfies ApproveOrganizationRequestDto));
  }

  @Patch()
  @SwaggerResponse(UpdateOrganizationResponseDto)
  async updateOrganization(
    @Body() body: UpdateOrganizationRequestDto,
  ): Promise<UpdateOrganizationResponseDto> {
    return this.commandBus.execute(new UpdateOrganizationContract(body));
  }
}
