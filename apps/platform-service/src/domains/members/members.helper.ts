import type { Member } from '@pkg/database';

import type { MemberResponseDto } from './queries/get-member.response.dto';

export function buildMemberResponse(member: Member): MemberResponseDto {
  return new MemberResponseDto(member);
}
