import { Command } from '@nestjs/cqrs';

import type { MemberOutputId, ReviveInviteInput } from '../members.types';

export class ReviveInviteCommand extends Command<MemberOutputId> {
  constructor(readonly payload: ReviveInviteInput) {
    super();
  }
}
