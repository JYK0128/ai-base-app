import { Command } from '@nestjs/cqrs';

import type { MemberIdRecord, UpdateMemberStatusInput } from '../members.contract';

export class UpdateMemberStatusCommand extends Command<MemberIdRecord> {
  constructor(readonly payload: UpdateMemberStatusInput) {
    super();
  }
}
