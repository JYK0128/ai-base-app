import type { InviteStatus, MemberRole } from '../members.types';

export class GetInvitesQuery {
  constructor(
    readonly search?: string,
    readonly inviteStatus?: InviteStatus,
    readonly role?: MemberRole,
  ) {}
}
