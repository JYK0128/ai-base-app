import type { GetMembersInput } from '../members.types';

export class GetMembersQuery {
  constructor(readonly payload: GetMembersInput) {}
}
