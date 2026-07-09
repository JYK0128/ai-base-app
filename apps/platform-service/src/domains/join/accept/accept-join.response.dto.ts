import { ApiProperty } from '@nestjs/swagger';

import { PayloadResponseDto } from '@/common/interfaces';
export class AcceptJoinResponseDto extends PayloadResponseDto {
  constructor(args: AcceptJoinResponseDto) {
    super();
    this.memberId = args.memberId;
    this.accountId = args.accountId;
    this.inviteId = args.inviteId;
  }

  @ApiProperty({ type: String, description: '멤버 식별자' })
  memberId!: string;

  @ApiProperty({ type: String, description: '계정 식별자' })
  accountId!: string;

  @ApiProperty({ type: String, description: '초대 식별자' })
  inviteId!: string;
}
