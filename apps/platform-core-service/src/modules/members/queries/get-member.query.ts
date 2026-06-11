import { Query } from '@nestjs/cqrs';

import type { GetMemberInput, MemberRecord } from '../members.contract';

export class GetMemberQuery extends Query<MemberRecord> {
  constructor(readonly payload: GetMemberInput) {
    super();
  }
}
