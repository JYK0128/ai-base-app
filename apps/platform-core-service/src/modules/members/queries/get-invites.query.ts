import { Query } from '@nestjs/cqrs';

import type { GetInvitesInput, InviteRecord } from '../members.contract';

export class GetInvitesQuery extends Query<InviteRecord[]> {
  constructor(readonly payload: GetInvitesInput) {
    super();
  }
}
