import { Command } from '@nestjs/cqrs';

import type { CreateInviteInput } from '../members.types';
import type { InviteOutputResult } from '../members.types';

export class CreateInviteCommand extends Command<InviteOutputResult> {
  constructor(readonly payload: CreateInviteInput) {
    super();
  }
}
