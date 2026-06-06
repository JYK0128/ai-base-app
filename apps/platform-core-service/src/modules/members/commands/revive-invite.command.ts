import type { ReviveInviteInput } from '../members.types';

export class ReviveInviteCommand {
  constructor(readonly payload: ReviveInviteInput) {}
}
