import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocumentStatus } from '@pkg/database';

import { GetTermDocumentVersionItem } from '../get-term-document-version-list/get-term-document-version-list.response.dto';
import { GetTermDocumentItem } from './get-term-document-item.response.dto';

export class GetTermDocumentDetailResponseDto {
  constructor(
    document: GetTermDocumentItem,
    versions: GetTermDocumentVersionItem[],
    currentVersion?: GetTermDocumentVersionItem | null,
  ) {
    this.document = document;
    this.versions = versions;
    this.currentVersion = currentVersion ?? null;
  }

  @ApiProperty({ type: () => GetTermDocumentItem, example: { id: '019e5236-adae-70d7-a8f7-2dc90bdf7081', code: 'privacy', title: '개인정보 처리방침', required: true, status: TermsDocumentStatus.PUBLISHED }, description: '문서 기본 정보' })
  document!: GetTermDocumentItem;

  @ApiProperty({ type: () => [GetTermDocumentVersionItem], example: [], description: '버전 목록' })
  versions!: GetTermDocumentVersionItem[];

  @ApiPropertyOptional({ type: () => GetTermDocumentVersionItem, example: null, nullable: true, description: '현재 효력 중인 버전' })
  currentVersion?: GetTermDocumentVersionItem | null;
}
