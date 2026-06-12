import { ApiProperty } from '@nestjs/swagger';
import type { I18nLocale, I18nLocaleDirection } from '@pkg/database';

export class I18nLocaleResponseDto implements Pick<I18nLocale, 'code' | 'name' | 'regionCode' | 'direction' | 'isActive' | 'sortOrder'> {
  constructor(locale: I18nLocale) {
    this.code = locale.code;
    this.name = locale.name;
    this.regionCode = locale.regionCode;
    this.direction = locale.direction;
    this.isActive = locale.isActive;
    this.sortOrder = locale.sortOrder;
  }

  @ApiProperty({ example: 'ko-KR', description: '로케일 코드' })
  code!: string;

  @ApiProperty({ example: '한국어', description: '로케일 이름' })
  name!: string;

  @ApiProperty({ example: 'KR', required: false, nullable: true, description: '지역 코드' })
  regionCode?: string;

  @ApiProperty({ example: 'ltr', enum: ['ltr', 'rtl'], description: '문자 방향' })
  direction!: I18nLocaleDirection;

  @ApiProperty({ example: true, description: '활성화 여부' })
  isActive!: boolean;

  @ApiProperty({ example: 1, required: false, nullable: true, description: '정렬 순서' })
  sortOrder?: number;
}

export class GetLocalesResponseDto {
  constructor(list: I18nLocaleResponseDto[]) {
    this.list = list;
  }

  @ApiProperty({ type: [I18nLocaleResponseDto], description: '활성 로케일 목록' })
  list!: I18nLocaleResponseDto[];
}
