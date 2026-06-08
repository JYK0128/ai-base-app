import { Query } from '@nestjs/cqrs';

import type { GetMembersInput, MemberOutput } from '../members.types';

export class GetMembersQuery extends Query<MemberOutput[]> {
  constructor(readonly payload: GetMembersInput) {
    super();
  }
}
