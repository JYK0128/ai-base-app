import { ApiProperty } from '@nestjs/swagger';
import { type I18nLocale, I18nLocaleDirection } from '@pkg/database';

import type { EntityResponseDto, ListResponseDto } from '@/common/interfaces';

export class GetLocaleResponseDto implements EntityResponseDto<I18nLocale> {
  constructor(locale: I18nLocale) {
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
  code!: string;

  @ApiProperty({ example: '한국어', description: '로케일 이름' })
  name!: string;

  @ApiProperty({
    example: 'KR',
    required: false,
    nullable: true,
    description: '지역 코드',
  })
  regionCode?: string;

  @ApiProperty({
    example: I18nLocaleDirection.LTR,
    enum: I18nLocaleDirection,
    description: '문자 방향',
  })
  direction!: I18nLocaleDirection;

  @ApiProperty({ example: true, description: '활성화 여부' })
  isActive!: boolean;

  @ApiProperty({
    example: 1,
    required: false,
    nullable: true,
    description: '정렬 순서',
  })
  sortOrder?: number;
}

export class GetLocalesResponseDto implements ListResponseDto<I18nLocale> {
  constructor(items: GetLocaleResponseDto[]) {
    this.items = items;
  }

  @ApiProperty({
    type: [GetLocaleResponseDto],
    example: [],
    description: '활성 로케일 목록',
  })
  items!: GetLocaleResponseDto[];
}
