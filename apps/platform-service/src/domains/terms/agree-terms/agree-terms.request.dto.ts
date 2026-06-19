import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

import type { PayloadRequestDto } from '@/common/interfaces';

export class CreateTermsAgreementRequestDto implements PayloadRequestDto {
  @ApiProperty({
    example: ['019e5236-adae-70d7-a8f7-2dc90bdf7083', '019e5236-adae-70d7-a8f7-2dc90bdf7084'],
    description: '동의할 약관 버전 식별자 목록',
    isArray: true,
    type: String,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  termsVersionIds!: string[];
}
