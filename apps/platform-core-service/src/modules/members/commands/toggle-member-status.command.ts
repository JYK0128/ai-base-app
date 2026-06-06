import type { ToggleMemberStatusInput } from '../members.types';

export class ToggleMemberStatusCommand {
  constructor(readonly payload: ToggleMemberStatusInput) {}
}
