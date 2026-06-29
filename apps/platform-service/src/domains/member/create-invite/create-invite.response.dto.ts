import { MemberInvite } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class CreateInviteResponseDto extends IdResponseDto<MemberInvite> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
