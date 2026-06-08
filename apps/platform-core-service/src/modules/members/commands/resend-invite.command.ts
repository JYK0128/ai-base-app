import { Command } from '@nestjs/cqrs';

import type { ResendInviteInput } from '../members.types';
import type { InviteOutputResult } from '../members.types';

export class ResendInviteCommand extends Command<InviteOutputResult> {
  constructor(readonly payload: ResendInviteInput) {
    super();
  }
}
