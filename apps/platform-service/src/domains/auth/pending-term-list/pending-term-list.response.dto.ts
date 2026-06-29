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

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7081',
    description: '약관 문서 식별자',
  })
  documentId!: string;

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7082',
    description: '약관 버전 식별자',
  })
  versionId!: string;

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7001',
    nullable: true,
    description: '조직 식별자',
  })
  organizationId!: string | null;

  @ApiProperty({
    example: TermsDocumentScope.PLATFORM,
    enum: TermsDocumentScope,
    description: '약관 적용 범위',
  })
  scope!: TermsDocumentScope;

  @ApiProperty({
    example: 'v1.2.0',
    description: '약관 버전 태그',
  })
  version!: string;

  @ApiProperty({ example: true, description: '필수 동의 여부' })
  required!: boolean;

  @ApiProperty({ example: '개인정보 처리방침', description: '약관 제목' })
  title!: string;

  @ApiProperty({ example: '약관 본문 내용입니다...', description: '약관 내용' })
  content!: string;

  @ApiProperty({ example: false, description: '동의 여부' })
  agreed!: boolean;
}

export class PendingTermListResponseDto extends ListResponseDto<PendingTermListItem> {
  constructor(args: ListResponseDto<PendingTermListItem>) {
    super();
    this.items = args.items;
    this.offset = args.offset;
    this.limit = args.limit;
  }

  @ApiProperty({
    type: [PendingTermListItem],
    example: [],
    description: '동의 대기 약관 목록',
  })
  items!: PendingTermListItem[];
}
