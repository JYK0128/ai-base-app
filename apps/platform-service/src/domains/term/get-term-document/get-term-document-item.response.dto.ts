import { ApiProperty } from '@nestjs/swagger';
import { TermsDocument, TermsDocumentStatus } from '@pkg/database';

import { EntityResponseType } from '@/common/interfaces';
export class GetTermDocumentItem extends EntityResponseType(TermsDocument) {
  constructor(document: TermsDocument) {
    super();
    this.id = document.id;
    this.code = document.code;
    this.title = document.title;
    this.required = document.required;
    this.terminatedAt = document.terminatedAt ?? null;
    this.status = document.status;
    this.organizationId = document.organization?.id ?? null;
  }

  @ApiProperty({ type: String, description: '약관 문서 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '약관 코드' })
  override code!: string;

  @ApiProperty({ type: String, description: '약관 제목' })
  override title!: string;

  @ApiProperty({ type: Boolean, description: '필수 동의 여부' })
  override required!: boolean;

  @ApiProperty({ type: String, nullable: true, description: '종료 일시' })
  override terminatedAt!: Date | null;

  @ApiProperty({ enum: TermsDocumentStatus, description: '약관 상태' })
  override status!: TermsDocumentStatus;

  @ApiProperty({ type: String, nullable: true, description: '조직 식별자' })
  organizationId!: string | null;
}
