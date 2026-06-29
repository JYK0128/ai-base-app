import type { Member } from '@pkg/database';

import { IdRequestDto } from '@/common/interfaces';

export class GetMemberRequestDto extends IdRequestDto<Member> {
}
