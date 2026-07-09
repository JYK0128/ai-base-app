import { ApiProperty } from '@nestjs/swagger';

import { ListResponseDto } from '@/common/interfaces';

import { GetTermDocumentItem } from '../get-term-document/get-term-document-item.response.dto';
export class GetTermDocumentListResponseDto extends ListResponseDto<GetTermDocumentItem> {
  constructor(args: GetTermDocumentListResponseDto) {
    super();
    this.items = args.items;
  }

  @ApiProperty({ type: () => [GetTermDocumentItem], description: '약관 문서 목록' })
  items!: GetTermDocumentItem[];
}
