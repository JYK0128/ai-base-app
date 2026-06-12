import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateInviteContract } from './commands/create-invite.contract';
import type { CreateInviteRequestDto } from './commands/create-invite.request.dto';
import type { CreateInviteResponseDto } from './commands/create-invite.response.dto';
import { UpdateMemberRoleContract } from './commands/update-member-role.contract';
import type { UpdateMemberRoleRequestDto } from './commands/update-member-role.request.dto';
import { UpdateMemberStatusContract } from './commands/update-member-status.contract';
import type { UpdateMemberStatusRequestDto } from './commands/update-member-status.request.dto';
import type { MemberIdResponseDto } from './commands/update-member-status.response.dto';
import { GetMemberContract } from './queries/get-member.contract';
import type { GetMemberRequestDto } from './queries/get-member.request.dto';
import type { MemberResponseDto } from './queries/get-member.response.dto';
import { GetMembersContract } from './queries/get-members.contract';
import type { GetMembersRequestDto } from './queries/get-members.request.dto';

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
  ): Promise<MemberIdResponseDto> {
    return this.commandBus.execute(new UpdateMemberStatusContract(body));
  }

  @Post('role')
  async updateMemberRole(
    @Body() body: UpdateMemberRoleRequestDto,
  ): Promise<MemberIdResponseDto> {
    return this.commandBus.execute(new UpdateMemberRoleContract(body));
  }

  @Get()
  async getMembers(
    @Query() query: GetMembersRequestDto,
  ): Promise<MemberResponseDto[]> {
    return this.queryBus.execute(new GetMembersContract(query));
  }

  @Get(':id')
  async getMember(
    @Param('id') id: string,
  ): Promise<MemberResponseDto> {
    return this.queryBus.execute(new GetMemberContract({ id } satisfies GetMemberRequestDto));
  }
}
