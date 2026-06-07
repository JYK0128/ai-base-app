import { Command } from '@nestjs/cqrs';

import type { ResendInviteInput } from '../members.types';
import type { InviteMutationResult } from '../members.types';

export class ResendInviteCommand extends Command<InviteMutationResult> {
  constructor(readonly payload: ResendInviteInput) {}
}
