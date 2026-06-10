import { Command } from '@nestjs/cqrs';

import type { InviteIdRecord, ResendInviteInput } from '../members.contract';

export class ResendInviteCommand extends Command<InviteIdRecord> {
  constructor(readonly payload: ResendInviteInput) {
    super();
  }
}
