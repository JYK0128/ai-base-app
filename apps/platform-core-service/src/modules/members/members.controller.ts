import { Controller } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CancelInviteCommand,
         CreateInviteCommand,
         ResendInviteCommand,
         ReviveInviteCommand,
         ToggleMemberStatusCommand,
         UpdateMemberRoleCommand } from './commands';
import { InviteEmailEvent } from './events';
import { MEMBERS_SERVICE_PATTERNS } from './members.contract';
import type { CancelInviteInput, CreateInviteInput, GetInvitesInput, GetMemberInput, GetMembersInput, InviteMutationResult, ResendInviteInput, ReviveInviteInput, ToggleMemberStatusInput, UpdateMemberRoleInput } from './members.types';
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
    const result = await this.commandBus.execute(new CreateInviteCommand(data));
    this.publishInviteEmail(result);

    return {
      id: result.invite.id,
    };
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.RESEND)
  async resendInvite(
    @Payload() data: ResendInviteInput,
  ) {
    const result = await this.commandBus.execute(new ResendInviteCommand(data));
    this.publishInviteEmail(result);

    return {
      id: result.invite.id,
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

  private publishInviteEmail(result: InviteMutationResult): void {
    const attemptId = result.invite.metadata.mailDelivery?.attemptId;

    if (!attemptId) {
      throw new Error('MAIL_DELIVERY_ATTEMPT_ID_NOT_FOUND');
    }

    this.eventBus.publish(new InviteEmailEvent({
      inviteId: result.invite.id,
      attemptId,
      email: result.invite.email,
      organizationName: result.organization.name,
      inviterName: result.inviter.member.name,
      token: result.invite.token,
    }));
  }
}
