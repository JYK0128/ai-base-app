import { Command } from '@nestjs/cqrs';

import type { CreateInviteInput } from '../members.types';
import type { InviteMutationResult } from '../members.types';

export class CreateInviteCommand extends Command<InviteMutationResult> {
  constructor(readonly payload: CreateInviteInput) {}
}
