import type { GetInvitesInput } from '../members.types';

export class GetInvitesQuery {
  constructor(readonly payload: GetInvitesInput) {}
}
