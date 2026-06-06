import type { CreateInviteInput } from '../members.types';

export class CreateInviteCommand {
  constructor(readonly payload: CreateInviteInput) {}
}
