import { Member } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class UpdateMemberStatusResponseDto extends IdResponseDto<Member> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
