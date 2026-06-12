import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ApproveOrganizationContract } from './commands/approve-organization.contract';
import type { ApproveOrganizationRequestDto } from './commands/approve-organization.request.dto';
import type { ApproveOrganizationResponseDto } from './commands/approve-organization.response.dto';
import { GetOrganizationsContract } from './queries/get-organizations.contract';
import type { GetOrganizationsQueryDto } from './queries/get-organizations.request.dto';
import type { GetOrganizationsResponseDto } from './queries/get-organizations.response.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getOrganizations(
    @Query() query: GetOrganizationsQueryDto,
  ): Promise<GetOrganizationsResponseDto> {
    return this.queryBus.execute(new GetOrganizationsContract(query));
  }

  @Patch(':id/approve')
  async approveOrganization(
    @Param('id') id: string,
    @Body() body: ApproveOrganizationRequestDto,
  ): Promise<ApproveOrganizationResponseDto> {
    return this.commandBus.execute(new ApproveOrganizationContract({
      id,
      approve: body.approve,
    }));
  }
}
