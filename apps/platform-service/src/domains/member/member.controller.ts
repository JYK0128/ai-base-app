import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';

import { CancelInviteContract } from './cancel-invite/cancel-invite.contract';
import { CancelInviteRequestDto } from './cancel-invite/cancel-invite.request.dto';
import { CancelInviteResponseDto } from './cancel-invite/cancel-invite.response.dto';
import { CreateInviteContract } from './create-invite/create-invite.contract';
import { CreateInviteRequestDto } from './create-invite/create-invite.request.dto';
import { CreateInviteResponseDto } from './create-invite/create-invite.response.dto';
import { GetInvitePageContract } from './get-invite-page/get-invite-page.contract';
import { GetInvitePageRequestDto } from './get-invite-page/get-invite-page.request.dto';
import { GetInvitePageResponseDto } from './get-invite-page/get-invite-page.response.dto';
import { GetMemberContract } from './get-member/get-member.contract';
import { GetMemberRequestDto } from './get-member/get-member.request.dto';
import { GetMemberResponseDto } from './get-member/get-member.response.dto';
import { GetMemberPageContract } from './get-member-page/get-member-page.contract';
import { GetMemberPageRequestDto } from './get-member-page/get-member-page.request.dto';
import { GetMemberPageResponseDto } from './get-member-page/get-member-page.response.dto';
import { ResendInviteContract } from './resend-invite/resend-invite.contract';
import { ResendInviteRequestDto } from './resend-invite/resend-invite.request.dto';
import { ResendInviteResponseDto } from './resend-invite/resend-invite.response.dto';
import { UpdateMemberRoleContract } from './update-member-role/update-member-role.contract';
import { UpdateMemberRoleRequestDto } from './update-member-role/update-member-role.request.dto';
import { UpdateMemberRoleResponseDto } from './update-member-role/update-member-role.response.dto';
import { UpdateMemberStatusContract } from './update-member-status/update-member-status.contract';
import { UpdateMemberStatusRequestDto } from './update-member-status/update-member-status.request.dto';
import { UpdateMemberStatusResponseDto } from './update-member-status/update-member-status.response.dto';

@Controller('member')
export class MembersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('invites')
  @SwaggerResponse(CreateInviteResponseDto)
  async createInvite(
    @Body() body: CreateInviteRequestDto,
  ): Promise<CreateInviteResponseDto> {
    return this.commandBus.execute(new CreateInviteContract(body));
  }

  @Get('invites')
  @SwaggerResponse(GetInvitePageResponseDto)
  async getInvitePage(
    @Query() query: GetInvitePageRequestDto,
  ): Promise<GetInvitePageResponseDto> {
    return this.queryBus.execute(new GetInvitePageContract(query));
  }

  @Post('invites/:id/cancel')
  @SwaggerResponse(CancelInviteResponseDto)
  async cancelInvite(
    @Param('id') id: string,
  ): Promise<CancelInviteResponseDto> {
    return this.commandBus.execute(new CancelInviteContract({ id } satisfies CancelInviteRequestDto));
  }

  @Post('invites/:id/resend')
  @SwaggerResponse(ResendInviteResponseDto)
  async resendInvite(
    @Param('id') id: string,
  ): Promise<ResendInviteResponseDto> {
    return this.commandBus.execute(new ResendInviteContract({ id } satisfies ResendInviteRequestDto));
  }

  @Post('status')
  @SwaggerResponse(UpdateMemberStatusResponseDto)
  async updateMemberStatus(
    @Body() body: UpdateMemberStatusRequestDto,
  ): Promise<UpdateMemberStatusResponseDto> {
    return this.commandBus.execute(new UpdateMemberStatusContract(body));
  }

  @Post('role')
  @SwaggerResponse(UpdateMemberRoleResponseDto)
  async updateMemberRole(
    @Body() body: UpdateMemberRoleRequestDto,
  ): Promise<UpdateMemberRoleResponseDto> {
    return this.commandBus.execute(new UpdateMemberRoleContract(body));
  }

  @Get()
  @SwaggerResponse(GetMemberPageResponseDto)
  async getMemberPage(
    @Query() query: GetMemberPageRequestDto,
  ): Promise<GetMemberPageResponseDto> {
    return this.queryBus.execute(new GetMemberPageContract(query));
  }

  @Get(':id')
  @SwaggerResponse(GetMemberResponseDto)
  async getMember(
    @Param('id') id: string,
  ): Promise<GetMemberResponseDto> {
    return this.queryBus.execute(new GetMemberContract({ id } satisfies GetMemberRequestDto));
  }
}
