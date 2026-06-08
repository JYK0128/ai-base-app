import { Command } from '@nestjs/cqrs';

import type { MemberOutputId, UpdateMemberRoleInput } from '../members.types';

export class UpdateMemberRoleCommand extends Command<MemberOutputId> {
  constructor(readonly payload: UpdateMemberRoleInput) {
    super();
  }
}
