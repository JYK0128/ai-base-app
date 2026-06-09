import { Command } from '@nestjs/cqrs';

import type { InviteIdRecord } from '../members.contract';
import type { CreateInviteInput } from '../members.types';

export class CreateInviteCommand extends Command<InviteIdRecord> {
  constructor(readonly payload: CreateInviteInput) {
    super();
  }
}
