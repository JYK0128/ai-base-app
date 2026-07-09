import { ApiProperty } from '@nestjs/swagger';
import { I18nLocale, I18nLocaleDirection } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';
export class LocaleListItem extends EntityResponseType(I18nLocale) {
  constructor(locale: I18nLocale) {
    super();
    this.code = locale.code;
    this.name = locale.name;
    this.regionCode = locale.regionCode;
    this.direction = locale.direction;
    this.isActive = locale.isActive;
    this.sortOrder = locale.sortOrder;
  }

  @ApiProperty({ type: String, description: '로케일 코드' })
  override code!: string;

  @ApiProperty({ type: String, description: '로케일 이름' })
  override name!: string;

  @ApiProperty({ type: String, nullable: true, description: '지역 코드' })
  override regionCode!: string | null;

  @ApiProperty({ enum: I18nLocaleDirection, description: '문자 방향' })
  override direction!: I18nLocaleDirection;

  @ApiProperty({ type: Boolean, description: '활성화 여부' })
  override isActive!: boolean;

  @ApiProperty({ type: Number, nullable: true, description: '정렬 순서' })
  override sortOrder!: number | null;
}
export class GetLocaleListResponseDto extends ListResponseDto<LocaleListItem> {
  constructor(args: GetLocaleListResponseDto) {
    super();
    this.items = args.items;
  }

  @ApiProperty({ type: () => [LocaleListItem], description: '활성 로케일 목록' })
  items!: LocaleListItem[];
}
