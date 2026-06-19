import { ApiProperty } from '@nestjs/swagger';
import { TermsDocument } from '@pkg/database';
import { IsUUID } from 'class-validator';

import type { IdRequestDto } from '@/common/interfaces';

export class GetTermsDocumentRequestDto implements IdRequestDto<TermsDocument> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '약관 문서 식별자' })
  @IsUUID()
  id!: string;
}
