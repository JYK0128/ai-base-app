import { Controller } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CancelInviteCommand,
         CreateInviteCommand,
         ResendInviteCommand,
         ReviveInviteCommand,
         UpdateMemberRoleCommand, UpdateMemberStatusCommand } from './commands';
import { type CancelInviteInput, type CreateInviteInput, type GetInvitesInput, type GetMemberInput, type GetMembersInput, MEMBERS_SERVICE_PATTERNS, type ResendInviteInput, type ReviveInviteInput, type UpdateMemberRoleInput, type UpdateMemberStatusInput } from './members.contract';
import { GetInvitesQuery, GetMemberQuery, GetMembersQuery } from './queries';

@Controller()
export class MembersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
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
    @Payload() data: UpdateMemberStatusInput,
  ) {
    return this.commandBus.execute(new UpdateMemberStatusCommand(data));
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
    const result = await this.commandBus.execute(new CreateInviteCommand(data));

    return {
      id: result.id,
    };
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.RESEND)
  async resendInvite(
    @Payload() data: ResendInviteInput,
  ) {
    const result = await this.commandBus.execute(new ResendInviteCommand(data));

    return {
      id: result.id,
    };
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
