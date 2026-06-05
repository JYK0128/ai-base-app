import type { MemberRole, MemberStatus } from '../members.types';

export class GetMembersQuery {
  constructor(
    readonly search?: string,
    readonly status?: MemberStatus,
    readonly role?: MemberRole,
  ) {}
}
