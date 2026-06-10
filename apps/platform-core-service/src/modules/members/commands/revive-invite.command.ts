import { Command } from '@nestjs/cqrs';

import type { InviteIdRecord, ReviveInviteInput } from '../members.contract';

export class ReviveInviteCommand extends Command<InviteIdRecord> {
  constructor(readonly payload: ReviveInviteInput) {
    super();
  }
}
