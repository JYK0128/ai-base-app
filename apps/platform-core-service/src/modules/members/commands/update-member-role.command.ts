import type { MemberRole } from '../members.types';

export class UpdateMemberRoleCommand {
  constructor(
    readonly id: string,
    readonly role: MemberRole,
  ) {}
}
