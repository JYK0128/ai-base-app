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
import type { InviteStatus, MemberRole, MemberStatus } from './members.types';
import { GetInvitesQuery, GetMemberQuery, GetMembersQuery } from './queries';

@Controller()
export class MembersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.MEMBER.LIST)
  async getMembers(
    @Payload() data: {
      search?: string
      status?: MemberStatus
      role?: MemberRole
    },
  ) {
    return this.queryBus.execute(new GetMembersQuery(
      data.search,
      data.status,
      data.role,
    ));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.MEMBER.GET)
  async getMember(
    @Payload() data: {
      id: string
    },
  ) {
    return this.queryBus.execute(new GetMemberQuery(data.id));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.MEMBER.UPDATE_ROLE)
  async updateMemberRole(
    @Payload() data: {
      id: string
      role: MemberRole
    },
  ) {
    return this.commandBus.execute(new UpdateMemberRoleCommand(data.id, data.role));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.MEMBER.TOGGLE_STATUS)
  async toggleMemberStatus(
    @Payload() data: {
      id: string
    },
  ) {
    return this.commandBus.execute(new ToggleMemberStatusCommand(data.id));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.LIST)
  async getInvites(
    @Payload() data: {
      search?: string
      inviteStatus?: InviteStatus
      role?: MemberRole
    },
  ) {
    return this.queryBus.execute(new GetInvitesQuery(
      data.search,
      data.inviteStatus,
      data.role,
    ));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.CREATE)
  async createInvite(
    @Payload() data: {
      name: string
      email: string
      role: MemberRole
      note?: string
    },
  ) {
    return this.commandBus.execute(new CreateInviteCommand(
      data.name,
      data.email,
      data.role,
      data.note,
    ));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.RESEND)
  async resendInvite(
    @Payload() data: {
      id: string
    },
  ) {
    return this.commandBus.execute(new ResendInviteCommand(data.id));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.CANCEL)
  async cancelInvite(
    @Payload() data: {
      id: string
    },
  ) {
    return this.commandBus.execute(new CancelInviteCommand(data.id));
  }

  @MessagePattern(MEMBERS_SERVICE_PATTERNS.INVITE.REVIVE)
  async reviveInvite(
    @Payload() data: {
      id: string
    },
  ) {
    return this.commandBus.execute(new ReviveInviteCommand(data.id));
  }
}
