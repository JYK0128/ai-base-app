import type { Member } from '@pkg/database';

import type { MemberResponseDto } from './get-member/get-member.response.dto';

export function buildMemberResponse(member: Member): MemberResponseDto {
  return new MemberResponseDto(member);
}
