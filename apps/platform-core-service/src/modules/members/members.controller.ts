import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CancelInviteCommand,
         CreateInviteCommand,
         ResendInviteCommand,
         ReviveInviteCommand,
         ToggleMemberStatusCommand,
         UpdateMemberRoleCommand } from './commands';
import { MEMBERS_SERVICE_PATTERNS } from './members.constants';
import type { CancelInviteInput, CreateInviteInput, GetInvitesInput, GetMemberInput, GetMembersInput, ResendInviteInput, ReviveInviteInput, ToggleMemberStatusInput, UpdateMemberRoleInput } from './members.types';
import { GetInvitesQuery, GetMemberQuery, GetMembersQuery } from './queries';

@Controller()
export class MembersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.MEMBER.LIST)
  async getMembers(
    @Payload() data: GetMembersInput,
  ) {
    return this.queryBus.execute(new GetMembersQuery(data));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.MEMBER.GET)
  async getMember(
    @Payload() data: GetMemberInput,
  ) {
    return this.queryBus.execute(new GetMemberQuery(data));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.MEMBER.UPDATE_ROLE)
  async updateMemberRole(
    @Payload() data: UpdateMemberRoleInput,
  ) {
    return this.commandBus.execute(new UpdateMemberRoleCommand(data));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.MEMBER.TOGGLE_STATUS)
  async toggleMemberStatus(
    @Payload() data: ToggleMemberStatusInput,
  ) {
    return this.commandBus.execute(new ToggleMemberStatusCommand(data));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.LIST)
  async getInvites(
    @Payload() data: GetInvitesInput,
  ) {
    return this.queryBus.execute(new GetInvitesQuery(data));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.CREATE)
  async createInvite(
    @Payload() data: CreateInviteInput,
  ) {
    return this.commandBus.execute(new CreateInviteCommand(data));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.RESEND)
  async resendInvite(
    @Payload() data: ResendInviteInput,
  ) {
    return this.commandBus.execute(new ResendInviteCommand(data));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.CANCEL)
  async cancelInvite(
    @Payload() data: CancelInviteInput,
  ) {
    return this.commandBus.execute(new CancelInviteCommand(data));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.REVIVE)
  async reviveInvite(
    @Payload() data: ReviveInviteInput,
  ) {
    return this.commandBus.execute(new ReviveInviteCommand(data));
  }
}
