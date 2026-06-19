import { ApiProperty } from '@nestjs/swagger';
import type { Member, TermsVersion } from '@pkg/database';
import { IsUUID } from 'class-validator';

import type { PayloadRequestDto } from '@/common/interfaces';

export class CreateTermsAgreementRequestDto implements PayloadRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버' })
  @IsUUID()
  member!: Member['id'];

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7083', description: '동의할 약관 버전' })
  @IsUUID()
  termsVersion!: TermsVersion['id'];
}
