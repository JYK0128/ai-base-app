import { ApiProperty } from '@nestjs/swagger';
import { TermsVersion,
         TermsVersionStatus } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';

export class GetTermDocumentVersionItem extends EntityResponseType(TermsVersion) {
  constructor(version: TermsVersion) {
    super();
    this.id = version.id;
    this.content = version.content;
    this.checksum = version.checksum;
    this.status = version.status;
    this.effectiveAt = version.effectiveAt ?? undefined;
    this.label = version.label;
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7082',
    description: '약관 버전 식별자',
  })
  override id!: string;

  @ApiProperty({ example: '약관 본문 내용입니다...', description: '약관 내용' })
  override content!: string;

  @ApiProperty({ example: 'sha256-checksum...', description: '체크섬' })
  override checksum!: string;

  @ApiProperty({
    enum: TermsVersionStatus,
    example: TermsVersionStatus.PUBLISHED,
    description: '버전 상태',
  })
  override status!: TermsVersionStatus;

  @ApiProperty({
    example: '2026-06-06T14:00:00.000Z',
    description: '효력 일시',
  })
  override effectiveAt?: Date;

  @ApiProperty({ example: 'v1.0.0', description: '버전 라벨' })
  override label!: string;
}

export class GetTermDocumentVersionListResponseDto extends ListResponseDto<GetTermDocumentVersionItem> {
  constructor(args: ListResponseDto<GetTermDocumentVersionItem>) {
    super();
    this.items = args.items;
    this.offset = args.offset;
    this.limit = args.limit;
  }

  @ApiProperty({
    type: () => [GetTermDocumentVersionItem],
    example: [],
    description: '약관 버전 목록',
  })
  items!: GetTermDocumentVersionItem[];
}
