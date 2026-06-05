import type { MemberRole } from '../members.types';

export class CreateInviteCommand {
  constructor(
    readonly name: string,
    readonly email: string,
    readonly role: MemberRole,
    readonly note?: string,
  ) {}
}
