import { MemberInvite } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class ResendInviteResponseDto extends IdResponseDto<MemberInvite> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
