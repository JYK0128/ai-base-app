import type { GetMemberInput } from '../members.types';

export class GetMemberQuery {
  constructor(readonly payload: GetMemberInput) {}
}
