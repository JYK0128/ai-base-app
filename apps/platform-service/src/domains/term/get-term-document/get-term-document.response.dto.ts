import { ApiProperty } from '@nestjs/swagger';

import { GetTermDocumentVersionItem } from '../get-term-document-version-list/get-term-document-version-list.response.dto';
import { GetTermDocumentItem } from './get-term-document-item.response.dto';
export class GetTermDocumentDetailResponseDto {
  constructor(document: GetTermDocumentItem, versions: GetTermDocumentVersionItem[], currentVersion: GetTermDocumentVersionItem | null) {
    this.document = document;
    this.versions = versions;
    this.currentVersion = currentVersion ?? null;
  }

  @ApiProperty({ type: () => GetTermDocumentItem, description: '문서 기본 정보' })
  document!: GetTermDocumentItem;

  @ApiProperty({ type: () => [GetTermDocumentVersionItem], description: '버전 목록' })
  versions!: GetTermDocumentVersionItem[];

  @ApiProperty({ type: () => GetTermDocumentVersionItem, nullable: true, description: '현재 효력 중인 버전' })
  currentVersion!: GetTermDocumentVersionItem | null;
}
