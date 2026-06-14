import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateInviteContract } from './create-invite/create-invite.contract';
import { CreateInviteRequestDto } from './create-invite/create-invite.request.dto';
import { CreateInviteResponseDto } from './create-invite/create-invite.response.dto';
import { GetMemberContract } from './get-member/get-member.contract';
import { GetMemberRequestDto } from './get-member/get-member.request.dto';
import { GetMemberResponseDto } from './get-member/get-member.response.dto';
import { GetMembersContract } from './get-members/get-members.contract';
import { GetMembersRequestDto } from './get-members/get-members.request.dto';
import { GetMemberResponseDto as GetMembersItemResponseDto } from './get-members/get-members.response.dto';
import { UpdateMemberRoleContract } from './update-member-role/update-member-role.contract';
import { UpdateMemberRoleRequestDto } from './update-member-role/update-member-role.request.dto';
import { UpdateMemberRoleResponseDto } from './update-member-role/update-member-role.response.dto';
import { UpdateMemberStatusContract } from './update-member-status/update-member-status.contract';
import { UpdateMemberStatusRequestDto } from './update-member-status/update-member-status.request.dto';
import { UpdateMemberStatusResponseDto } from './update-member-status/update-member-status.response.dto';

@Controller('members')
export class MembersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('invites')
  async createInvite(
    @Body() body: CreateInviteRequestDto,
  ): Promise<CreateInviteResponseDto> {
    return this.commandBus.execute(new CreateInviteContract(body));
  }

  @Post('status')
  async toggleMemberStatus(
    @Body() body: UpdateMemberStatusRequestDto,
  ): Promise<UpdateMemberStatusResponseDto> {
    return this.commandBus.execute(new UpdateMemberStatusContract(body));
  }

  @Post('role')
  async updateMemberRole(
    @Body() body: UpdateMemberRoleRequestDto,
  ): Promise<UpdateMemberRoleResponseDto> {
    return this.commandBus.execute(new UpdateMemberRoleContract(body));
  }

  @Get()
  async getMembers(
    @Query() query: GetMembersRequestDto,
  ): Promise<GetMembersItemResponseDto[]> {
    return this.queryBus.execute(new GetMembersContract(query));
  }

  @Get(':id')
  async getMember(
    @Param('id') id: string,
  ): Promise<GetMemberResponseDto> {
    return this.queryBus.execute(new GetMemberContract({ id } satisfies GetMemberRequestDto));
  }
}
