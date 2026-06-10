import { Query } from '@nestjs/cqrs';

import type { InviteRecord } from '../members.contract';
import type { GetInvitesInput } from '../members.types';

export class GetInvitesQuery extends Query<InviteRecord[]> {
  constructor(readonly payload: GetInvitesInput) {
    super();
  }
}
