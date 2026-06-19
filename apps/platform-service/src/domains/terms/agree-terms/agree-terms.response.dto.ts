import { ApiProperty } from '@nestjs/swagger';
import { TermsConsent } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class CreateTermsAgreementResponseDto implements EntityResponseDto<TermsConsent> {
  constructor(consent: TermsConsent) {
    this.id = consent.id;
    this.agreed = consent.agreed;
    this.createdAt = consent.createdAt;
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7083',
    description: '동의 식별자',
  })
  id!: string;

  @ApiProperty({ example: true, description: '동의 여부' })
  agreed!: boolean;

  @ApiProperty({
    example: '2026-05-11T00:00:00.000Z',
    description: '생성 일시',
  })
  createdAt!: Date;
}
