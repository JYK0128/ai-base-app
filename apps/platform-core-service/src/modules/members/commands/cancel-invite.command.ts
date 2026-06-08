import { Command } from '@nestjs/cqrs';

import type { CancelInviteInput, MemberOutputId } from '../members.types';

export class CancelInviteCommand extends Command<MemberOutputId> {
  constructor(readonly payload: CancelInviteInput) {
    super();
  }
}
