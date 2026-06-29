import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocument,
         TermsDocumentStatus } from '@pkg/database';

import { EntityResponseType } from '@/common/interfaces';

export class GetTermDocumentItem extends EntityResponseType(TermsDocument) {
  constructor(document: TermsDocument) {
    super();
    this.id = document.id;
    this.code = document.code;
    this.title = document.title;
    this.required = document.required;
    this.terminatedAt = document.terminatedAt ?? undefined;
    this.status = document.status;
    this.organization = document.organization?.id;
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7081',
    description: '약관 문서 식별자',
  })
  override id!: string;

  @ApiProperty({ example: 'privacy', description: '약관 코드' })
  override code!: string;

  @ApiProperty({ example: '개인정보 처리방침', description: '약관 제목' })
  override title!: string;

  @ApiProperty({ example: true, description: '필수 동의 여부' })
  override required!: boolean;

  @ApiPropertyOptional({
    example: '2026-06-06T14:00:00.000Z',
    description: '종료 일시',
  })
  override terminatedAt?: Date;

  @ApiProperty({
    enum: TermsDocumentStatus,
    example: TermsDocumentStatus.PUBLISHED,
    description: '약관 상태',
  })
  override status!: TermsDocumentStatus;

  @ApiPropertyOptional({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7088',
    description: '조직 식별자',
  })
  override organization?: string;
}
