import { Command } from '@nestjs/cqrs';

import type { MemberOutputId, ToggleMemberStatusInput } from '../members.types';

export class ToggleMemberStatusCommand extends Command<MemberOutputId> {
  constructor(readonly payload: ToggleMemberStatusInput) {
    super();
  }
}
