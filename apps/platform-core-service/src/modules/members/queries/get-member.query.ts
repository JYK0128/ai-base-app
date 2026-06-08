import { Query } from '@nestjs/cqrs';

import type { GetMemberInput, MemberOutput } from '../members.types';

export class GetMemberQuery extends Query<MemberOutput> {
  constructor(readonly payload: GetMemberInput) {
    super();
  }
}
