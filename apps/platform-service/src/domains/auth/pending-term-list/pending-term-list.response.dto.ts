import { ApiProperty } from '@nestjs/swagger';
import { TermsDocumentScope } from '@pkg/database';

import { ListResponseDto } from '@/common/interfaces';
export class PendingTermListItem {
  constructor(args: PendingTermListItem) {
    this.documentId = args.documentId;
    this.versionId = args.versionId;
    this.organizationId = args.organizationId;
    this.scope = args.organizationId ? TermsDocumentScope.ORGANIZATION : TermsDocumentScope.PLATFORM;
    this.required = args.required;
    this.title = args.title;
    this.version = args.version;
    this.content = args.content;
    this.agreed = args.agreed;
  }

  @ApiProperty({ type: String, description: '약관 문서 식별자' })
  documentId!: string;

  @ApiProperty({ type: String, description: '약관 버전 식별자' })
  versionId!: string;

  @ApiProperty({ type: String, nullable: true, description: '조직 식별자' })
  organizationId!: string | null;

  @ApiProperty({ type: String, enum: TermsDocumentScope, description: '약관 적용 범위' })
  scope!: TermsDocumentScope;

  @ApiProperty({ type: String, description: '약관 버전 태그' })
  version!: string;

  @ApiProperty({ type: Boolean, description: '필수 동의 여부' })
  required!: boolean;

  @ApiProperty({ type: String, description: '약관 제목' })
  title!: string;

  @ApiProperty({ type: String, description: '약관 내용' })
  content!: string;

  @ApiProperty({ type: Boolean, description: '동의 여부' })
  agreed!: boolean;
}
export class PendingTermListResponseDto extends ListResponseDto<PendingTermListItem> {
  constructor(args: PendingTermListResponseDto) {
    super();
    this.items = args.items;
  }

  @ApiProperty({ type: () => [PendingTermListItem], description: '동의 대기 약관 목록' })
  items!: PendingTermListItem[];
}
