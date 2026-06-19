import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ApproveOrganizationContract } from './approve-organization/approve-organization.contract';
import { ApproveOrganizationRequestDto } from './approve-organization/approve-organization.request.dto';
import { ApproveOrganizationResponseDto } from './approve-organization/approve-organization.response.dto';
import { GetOrganizationPageContract } from './get-organization-page/get-organization-page.contract';
import { GetOrganizationPageRequestDto } from './get-organization-page/get-organization-page.request.dto';
import { GetOrganizationPageResponseDto } from './get-organization-page/get-organization-page.response.dto';
import { GetOrganizationRolesContract } from './get-organization-roles/get-organization-roles.contract';
import { GetOrganizationRoleResponseDto } from './get-organization-roles/get-organization-roles.response.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getOrganizationPage(
    @Query() query: GetOrganizationPageRequestDto,
  ): Promise<GetOrganizationPageResponseDto> {
    return this.queryBus.execute(new GetOrganizationPageContract(query));
  }

  @Get('roles')
  async getOrganizationRoles(): Promise<GetOrganizationRoleResponseDto[]> {
    return this.queryBus.execute(new GetOrganizationRolesContract());
  }

  @Patch(':id/approve')
  async approveOrganization(
    @Param('id') id: string,
    @Body() body: ApproveOrganizationRequestDto,
  ): Promise<ApproveOrganizationResponseDto> {
    return this.commandBus.execute(new ApproveOrganizationContract({
      id,
      approve: body.approve,
    } satisfies ApproveOrganizationRequestDto));
  }
}
