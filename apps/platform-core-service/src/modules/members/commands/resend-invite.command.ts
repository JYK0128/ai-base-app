import { Command } from '@nestjs/cqrs';

import type { InviteIdRecord } from '../members.contract';
import type { ResendInviteInput } from '../members.types';

export class ResendInviteCommand extends Command<InviteIdRecord> {
  constructor(readonly payload: ResendInviteInput) {
    super();
  }
}
