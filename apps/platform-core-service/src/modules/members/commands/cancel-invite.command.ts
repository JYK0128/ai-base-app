import type { CancelInviteInput } from '../members.types';

export class CancelInviteCommand {
  constructor(readonly payload: CancelInviteInput) {}
}
