import { ApiProperty } from '@nestjs/swagger';

import { ListResponseDto } from '@/common/interfaces';

import { GetTermDocumentItem } from '../get-term-document/get-term-document-item.response.dto';

export class GetTermDocumentListResponseDto extends ListResponseDto<GetTermDocumentItem> {
  constructor(args: ListResponseDto<GetTermDocumentItem>) {
    super();
    this.items = args.items;
    this.offset = args.offset;
    this.limit = args.limit;
  }

  @ApiProperty({
    type: () => [GetTermDocumentItem],
    example: [],
    description: '약관 문서 목록',
  })
  items!: GetTermDocumentItem[];
}
