import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { ApproveOrganizationContract } from './approve-organization/approve-organization.contract';
import { ApproveOrganizationRequestDto } from './approve-organization/approve-organization.request.dto';
import { ApproveOrganizationResponseDto } from './approve-organization/approve-organization.response.dto';
import { CreateOrganizationRoleContract } from './create-organization-role/create-organization-role.contract';
import { CreateOrganizationRoleRequestDto } from './create-organization-role/create-organization-role.request.dto';
import { CreateOrganizationRoleResponseDto } from './create-organization-role/create-organization-role.response.dto';
import { DeleteOrganizationRoleContract } from './delete-organization-role/delete-organization-role.contract';
import { DeleteOrganizationRoleRequestDto } from './delete-organization-role/delete-organization-role.request.dto';
import { DeleteOrganizationRoleResponseDto } from './delete-organization-role/delete-organization-role.response.dto';
import { GetOrganizationListContract } from './get-organization-list/get-organization-list.contract';
import { GetOrganizationListRequestDto } from './get-organization-list/get-organization-list.request.dto';
import { GetOrganizationListResponseDto } from './get-organization-list/get-organization-list.response.dto';
import { GetOrganizationRoleListContract } from './organization-role-list/get-organization-role-list.contract';
import { GetOrganizationRoleListResponseDto } from './organization-role-list/get-organization-role-list.response.dto';
import { UpdateOrganizationContract } from './update-organization/update-organization.contract';
import { UpdateOrganizationRequestDto } from './update-organization/update-organization.request.dto';
import { UpdateOrganizationResponseDto } from './update-organization/update-organization.response.dto';
import { UpdateOrganizationRoleContract } from './update-organization-role/update-organization-role.contract';
import { UpdateOrganizationRoleRequestDto } from './update-organization-role/update-organization-role.request.dto';
import { UpdateOrganizationRoleResponseDto } from './update-organization-role/update-organization-role.response.dto';
import { UpdateOrganizationRoleSortContract } from './update-organization-role-sort/update-organization-role-sort.contract';
import { UpdateOrganizationRoleSortRequestDto } from './update-organization-role-sort/update-organization-role-sort.request.dto';
import { UpdateOrganizationRoleSortResponseDto } from './update-organization-role-sort/update-organization-role-sort.response.dto';

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

  @Post('roles')
  @SwaggerResponse(CreateOrganizationRoleResponseDto)
  async createOrganizationRole(
    @Body() body: CreateOrganizationRoleRequestDto,
  ): Promise<CreateOrganizationRoleResponseDto> {
    return this.commandBus.execute(new CreateOrganizationRoleContract(body));
  }

  @Patch('roles/:id')
  @SwaggerResponse(UpdateOrganizationRoleResponseDto)
  async updateOrganizationRole(
    @Param('id') id: string,
    @Body() body: UpdateOrganizationRoleRequestDto,
  ): Promise<UpdateOrganizationRoleResponseDto> {
    return this.commandBus.execute(new UpdateOrganizationRoleContract({
      ...body,
      id,
    } satisfies UpdateOrganizationRoleRequestDto));
  }

  @Delete('roles/:id')
  @SwaggerResponse(DeleteOrganizationRoleResponseDto)
  async deleteOrganizationRole(
    @Param('id') id: string,
  ): Promise<DeleteOrganizationRoleResponseDto> {
    return this.commandBus.execute(new DeleteOrganizationRoleContract({ id } satisfies DeleteOrganizationRoleRequestDto));
  }

  @Post('roles/update-sort')
  @SwaggerResponse(UpdateOrganizationRoleSortResponseDto)
  async updateOrganizationRoleSort(
    @Body() body: UpdateOrganizationRoleSortRequestDto,
  ): Promise<UpdateOrganizationRoleSortResponseDto> {
    return this.commandBus.execute(new UpdateOrganizationRoleSortContract(body));
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
