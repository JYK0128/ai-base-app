import { Command } from '@nestjs/cqrs';

import type { MemberIdRecord, UpdateMemberRoleInput } from '../members.contract';

export class UpdateMemberRoleCommand extends Command<MemberIdRecord> {
  constructor(readonly payload: UpdateMemberRoleInput) {
    super();
  }
}
