import { Command } from '@nestjs/cqrs';

import type { CreateInviteInput, InviteIdRecord } from '../members.contract';

export class CreateInviteCommand extends Command<InviteIdRecord> {
  constructor(readonly payload: CreateInviteInput) {
    super();
  }
}
