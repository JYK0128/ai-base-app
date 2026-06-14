import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { UpdateOrganizationApprovalContract } from './commands/approve-organization.contract';
import { UpdateOrganizationApprovalRequestDto } from './commands/approve-organization.request.dto';
import { UpdateOrganizationApprovalResponseDto } from './commands/approve-organization.response.dto';
import { GetOrganizationRolesContract } from './queries/get-organization-roles.contract';
import { GetOrganizationRoleResponseDto } from './queries/get-organization-roles.response.dto';
import { GetOrganizationsContract } from './queries/get-organizations.contract';
import { GetOrganizationsRequestDto } from './queries/get-organizations.request.dto';
import { GetOrganizationsResponseDto } from './queries/get-organizations.response.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getOrganizations(
    @Query() query: GetOrganizationsRequestDto,
  ): Promise<GetOrganizationsResponseDto> {
    return this.queryBus.execute(new GetOrganizationsContract(query));
  }

  @Get('roles')
  async getOrganizationRoles(): Promise<GetOrganizationRoleResponseDto[]> {
    return this.queryBus.execute(new GetOrganizationRolesContract());
  }

  @Patch(':id/approve')
  async approveOrganization(
    @Param('id') id: string,
    @Body() body: UpdateOrganizationApprovalRequestDto,
  ): Promise<UpdateOrganizationApprovalResponseDto> {
    return this.commandBus.execute(new UpdateOrganizationApprovalContract({
      id,
      approve: body.approve,
    } satisfies UpdateOrganizationApprovalRequestDto));
  }
}
