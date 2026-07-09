import { ApiProperty } from '@nestjs/swagger';
import { TermsVersion, TermsVersionStatus } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';
type TermsVersionMetadata = {
  reason: string | null
  summary: string | null
};
export class GetTermDocumentVersionItem extends EntityResponseType(TermsVersion) {
  constructor(version: TermsVersion) {
    super();
    const metadata = version.metadata as Partial<TermsVersionMetadata> | undefined;
    this.id = version.id;
    this.content = version.content;
    this.checksum = version.checksum;
    this.status = version.status;
    this.effectiveAt = version.effectiveAt;
    this.label = version.label;
    this.summary = metadata?.summary ?? null;
    this.reason = metadata?.reason ?? null;
  }

  @ApiProperty({ type: String, description: '약관 버전 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '약관 내용' })
  override content!: string;

  @ApiProperty({ type: String, description: '체크섬' })
  override checksum!: string;

  @ApiProperty({ enum: TermsVersionStatus, description: '버전 상태' })
  override status!: TermsVersionStatus;

  @ApiProperty({ type: String, description: '효력 일시' })
  override effectiveAt!: Date;

  @ApiProperty({ type: String, description: '버전 라벨' })
  override label!: string;

  @ApiProperty({ type: String, nullable: true, description: '개정 요약' })
  summary: string | null;

  @ApiProperty({ type: String, nullable: true, description: '변경 사유' })
  reason: string | null;
}
export class GetTermDocumentVersionListResponseDto extends ListResponseDto<GetTermDocumentVersionItem> {
  constructor(args: GetTermDocumentVersionListResponseDto) {
    super();
    this.items = args.items;
  }

  @ApiProperty({ type: () => [GetTermDocumentVersionItem], description: '약관 버전 목록' })
  items!: GetTermDocumentVersionItem[];
}
