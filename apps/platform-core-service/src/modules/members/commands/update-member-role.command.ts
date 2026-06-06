import type { UpdateMemberRoleInput } from '../members.types';

export class UpdateMemberRoleCommand {
  constructor(readonly payload: UpdateMemberRoleInput) {}
}
