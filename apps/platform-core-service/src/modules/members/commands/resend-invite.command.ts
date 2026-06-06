import type { ResendInviteInput } from '../members.types';

export class ResendInviteCommand {
  constructor(readonly payload: ResendInviteInput) {}
}
