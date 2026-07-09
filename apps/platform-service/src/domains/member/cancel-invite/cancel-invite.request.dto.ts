import type { MemberInvite } from '@pkg/database';

import { IdRequestDto } from '@/common/interfaces';

export class CancelInviteRequestDto extends IdRequestDto<MemberInvite> {
}
