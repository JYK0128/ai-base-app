import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CheckPermissions } from '@/common/decorators/permissions.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';

import { CancelInviteDto, CreateInviteDto, GetInvitesQueryDto, GetMembersQueryDto, IdParamDto, ResendInviteDto, ReviveInviteDto, ToggleMemberStatusDto, UpdateMemberRoleDto } from './dto/members-request.dto';
import { InviteResponseDto, MemberMutationResponseDto, MemberResponseDto } from './dto/members-response.dto';
import { MembersClient } from './members.client';

@ApiTags('Members')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  constructor(private readonly membersClient: MembersClient) {}

  @Get('invites')
  @CheckPermissions('MEMBER:READ')
  @ApiOperation({
    summary: '초대 목록 조회',
    description: '멤버 초대 목록을 조회합니다.',
  })
  @SwaggerResult([InviteResponseDto])
  async getInvites(@Query() query: GetInvitesQueryDto) {
    const result = await this.membersClient.getInvites({
      search: query.search,
      inviteStatus: query.inviteStatus,
      role: query.role,
    });
    return ApiResponse.success(result, '초대 목록을 조회했습니다.');
  }

  @Get()
  @CheckPermissions('MEMBER:READ')
  @ApiOperation({
    summary: '멤버 목록 조회',
    description: '멤버 목록을 조회합니다.',
  })
  @SwaggerResult([MemberResponseDto])
  async getMembers(@Query() query: GetMembersQueryDto) {
    const result = await this.membersClient.getMembers({
      search: query.search,
      status: query.status,
      role: query.role,
    });
    return ApiResponse.success(result, '멤버 목록을 조회했습니다.');
  }

  @Get(':id')
  @CheckPermissions('MEMBER:READ')
  @ApiOperation({
    summary: '멤버 상세 조회',
    description: '멤버 상세 정보를 조회합니다.',
  })
  @SwaggerResult(MemberResponseDto)
  async getMember(@Param() params: IdParamDto) {
    const result = await this.membersClient.getMember(params.id);
    return ApiResponse.success(result, '멤버 상세를 조회했습니다.');
  }

  @Post('role')
  @CheckPermissions('MEMBER:UPDATE')
  @ApiOperation({
    summary: '멤버 권한 변경',
    description: '멤버의 권한을 변경합니다.',
  })
  @SwaggerResult(MemberMutationResponseDto)
  async updateMemberRole(
    @Body() body: UpdateMemberRoleDto,
  ) {
    const result = await this.membersClient.updateMemberRole(body.id, body.role);
    return ApiResponse.success(result, '멤버 권한을 변경했습니다.');
  }

  @Post('status')
  @CheckPermissions('MEMBER:UPDATE')
  @ApiOperation({
    summary: '멤버 상태 변경',
    description: '멤버의 활성 상태를 변경합니다.',
  })
  @SwaggerResult(MemberMutationResponseDto)
  async toggleMemberStatus(@Body() body: ToggleMemberStatusDto) {
    const result = await this.membersClient.toggleMemberStatus(body.id);
    return ApiResponse.success(result, '멤버 상태를 변경했습니다.');
  }

  @Post('invites')
  @CheckPermissions('MEMBER:CREATE')
  @ApiOperation({
    summary: '멤버 초대 생성',
    description: '새 멤버 초대를 생성합니다.',
  })
  @SwaggerResult(MemberMutationResponseDto)
  async createInvite(@Body() body: CreateInviteDto) {
    const result = await this.membersClient.createInvite(body);
    return ApiResponse.success(result, '멤버 초대를 생성했습니다.');
  }

  @Post('invites/resend')
  @CheckPermissions('MEMBER:UPDATE')
  @ApiOperation({
    summary: '초대 재전송',
    description: '멤버 초대를 재전송합니다.',
  })
  @SwaggerResult(MemberMutationResponseDto)
  async resendInvite(@Body() body: ResendInviteDto) {
    const result = await this.membersClient.resendInvite(body.id);
    return ApiResponse.success(result, '멤버 초대를 재전송했습니다.');
  }

  @Post('invites/cancel')
  @CheckPermissions('MEMBER:UPDATE')
  @ApiOperation({
    summary: '초대 취소',
    description: '멤버 초대를 취소합니다.',
  })
  @SwaggerResult(MemberMutationResponseDto)
  async cancelInvite(@Body() body: CancelInviteDto) {
    const result = await this.membersClient.cancelInvite(body.id);
    return ApiResponse.success(result, '멤버 초대를 취소했습니다.');
  }

  @Post('invites/revive')
  @CheckPermissions('MEMBER:UPDATE')
  @ApiOperation({
    summary: '초대 복구',
    description: '취소된 멤버 초대를 복구합니다.',
  })
  @SwaggerResult(MemberMutationResponseDto)
  async reviveInvite(@Body() body: ReviveInviteDto) {
    const result = await this.membersClient.reviveInvite(body.id);
    return ApiResponse.success(result, '멤버 초대를 복구했습니다.');
  }
}
