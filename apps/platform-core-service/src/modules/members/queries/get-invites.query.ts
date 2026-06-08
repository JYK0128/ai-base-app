import { Query } from '@nestjs/cqrs';

import type { GetInvitesInput, InviteOutput } from '../members.types';

export class GetInvitesQuery extends Query<InviteOutput[]> {
  constructor(readonly payload: GetInvitesInput) {
    super();
  }
}
