import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { CreateInviteDto, InviteStatusDto, MemberRoleDto, MemberStatusDto } from './dto/members-request.dto';
import { MEMBERS_SERVICE, MEMBERS_SERVICE_PATTERNS } from './members.constants';

@Injectable()
export class MembersClient extends CoreClient {
  constructor(
    @Inject(MEMBERS_SERVICE) client: ClientProxy,
    cls: ClsService,
  ) {
    super(client, cls);
  }

  async getMembers(query: {
    search?: string
    status?: MemberStatusDto
    role?: MemberRoleDto
  }) {
    return this.send(MEMBERS_SERVICE_PATTERNS.MEMBER.LIST, query);
  }

  async getMember(id: string) {
    return this.send(MEMBERS_SERVICE_PATTERNS.MEMBER.GET, { id });
  }

  async updateMemberRole(id: string, role: MemberRoleDto) {
    return this.send(MEMBERS_SERVICE_PATTERNS.MEMBER.UPDATE_ROLE, { id, role });
  }

  async toggleMemberStatus(id: string) {
    return this.send(MEMBERS_SERVICE_PATTERNS.MEMBER.TOGGLE_STATUS, { id });
  }

  async getInvites(query: {
    search?: string
    inviteStatus?: InviteStatusDto
    role?: MemberRoleDto
  }) {
    return this.send(MEMBERS_SERVICE_PATTERNS.INVITE.LIST, query);
  }

  async createInvite(data: CreateInviteDto) {
    return this.send(MEMBERS_SERVICE_PATTERNS.INVITE.CREATE, data);
  }

  async resendInvite(id: string) {
    return this.send(MEMBERS_SERVICE_PATTERNS.INVITE.RESEND, { id });
  }

  async cancelInvite(id: string) {
    return this.send(MEMBERS_SERVICE_PATTERNS.INVITE.CANCEL, { id });
  }

  async reviveInvite(id: string) {
    return this.send(MEMBERS_SERVICE_PATTERNS.INVITE.REVIVE, { id });
  }
}
