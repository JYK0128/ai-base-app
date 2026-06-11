import { Query } from '@nestjs/cqrs';

import type { GetMembersInput, MemberRecord } from '../members.contract';

export class GetMembersQuery extends Query<MemberRecord[]> {
  constructor(readonly payload: GetMembersInput) {
    super();
  }
}
