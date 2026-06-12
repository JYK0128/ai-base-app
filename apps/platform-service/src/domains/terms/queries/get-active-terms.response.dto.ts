import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocument, TermsDocumentStatus } from '@pkg/database';

export class TermsDocumentResponseDto implements Pick<TermsDocument, 'id' | 'code' | 'title' | 'required' | 'deprecatedAt' | 'status'> {
  constructor(document: TermsDocument) {
    this.id = document.id;
    this.code = document.code;
    this.title = document.title;
    this.required = document.required;
    this.deprecatedAt = document.deprecatedAt;
    this.status = document.status;
    this.organizationId = document.organization ? document.organization.id : null;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '약관 문서 식별자' })
  id!: string;

  @ApiProperty({ example: 'privacy', description: '약관 코드' })
  code!: string;

  @ApiProperty({ example: '개인정보 처리방침', description: '약관 제목' })
  title!: string;

  @ApiProperty({ example: true, description: '필수 동의 여부' })
  required!: boolean;

  @ApiPropertyOptional({ example: '2026-06-06T14:00:00.000Z', description: '폐기 일시' })
  deprecatedAt?: Date;

  @ApiProperty({ enum: TermsDocumentStatus, example: 'PUBLISHED', description: '약관 상태' })
  status!: TermsDocumentStatus;

  @ApiPropertyOptional({
    type: String,
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7088',
    nullable: true,
    description: '조직 식별자',
  })
  organizationId?: string | null;
}
