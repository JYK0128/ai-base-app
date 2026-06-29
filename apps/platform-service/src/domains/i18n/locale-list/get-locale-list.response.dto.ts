import { ApiProperty } from '@nestjs/swagger';
import { I18nLocale, I18nLocaleDirection } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';

export class LocaleListItem extends EntityResponseType(I18nLocale) {
  constructor(locale: I18nLocale) {
    super();
    this.code = locale.code;
    this.name = locale.name;
    if (typeof locale.regionCode === 'string') {
      this.regionCode = locale.regionCode;
    }
    this.direction = locale.direction;
    this.isActive = locale.isActive;
    if (typeof locale.sortOrder === 'number') {
      this.sortOrder = locale.sortOrder;
    }
  }

  @ApiProperty({ example: 'ko-KR', description: '로케일 코드' })
  override code!: string;

  @ApiProperty({ example: '한국어', description: '로케일 이름' })
  override name!: string;

  @ApiProperty({
    example: 'KR',
    required: false,
    nullable: true,
    description: '지역 코드',
  })
  override regionCode?: string;

  @ApiProperty({
    example: I18nLocaleDirection.LTR,
    enum: I18nLocaleDirection,
    description: '문자 방향',
  })
  override direction!: I18nLocaleDirection;

  @ApiProperty({ example: true, description: '활성화 여부' })
  override isActive!: boolean;

  @ApiProperty({
    example: 1,
    required: false,
    nullable: true,
    description: '정렬 순서',
  })
  override sortOrder?: number;
}

export class GetLocaleListResponseDto extends ListResponseDto<LocaleListItem> {
  constructor(args: ListResponseDto<LocaleListItem>) {
    super();
    this.items = args.items;
    this.offset = args.offset;
    this.limit = args.limit;
  }

  @ApiProperty({
    type: [LocaleListItem],
    example: [],
    description: '활성 로케일 목록',
  })
  items!: LocaleListItem[];
}
