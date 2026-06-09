import { Command } from '@nestjs/cqrs';

import type { CancelInviteInput, InviteIdRecord } from '../members.contract';

export class CancelInviteCommand extends Command<InviteIdRecord> {
  constructor(readonly payload: CancelInviteInput) {
    super();
  }
}
