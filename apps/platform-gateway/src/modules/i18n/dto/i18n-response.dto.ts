import { ApiProperty } from '@nestjs/swagger';

import { SwaggerSchema } from '@/common/decorators/swagger-schema.decorator';

export class LocaleDto {
  @ApiProperty({ example: 'ko', description: '로케일 코드' })
  code!: string;

  @ApiProperty({ example: '한국어', description: '이름' })
  name!: string;

  @ApiProperty({ example: 'KR', required: false, description: '지역 코드' })
  regionCode?: string;

  @ApiProperty({ example: 'ltr', enum: ['ltr', 'rtl'], description: '문자 방향' })
  direction!: 'ltr' | 'rtl';

  @ApiProperty({ example: true, description: '활성화 여부' })
  isActive!: boolean;

  @ApiProperty({ example: 1, required: false, description: '정렬 순서' })
  sortOrder?: number;
}

export class LocalesDataDto {
  @ApiProperty({ type: [LocaleDto], description: '로케일 목록' })
  list!: LocaleDto[];
}

@SwaggerSchema({
  type: 'object',
  additionalProperties: {
    type: 'object',
    additionalProperties: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    },
  },
  example: {
    ko: {
      resource: {
        DASHBOARD: '대시보드',
      },
    },
    en: {
      resource: {
        DASHBOARD: 'Dashboard',
      },
    },
  },
})
export class TranslationDataDto {
  [locale: string]: {
    [namespace: string]: {
      [key: string]: string
    }
  };
}

@SwaggerSchema({
  type: 'object',
  additionalProperties: {
    type: 'object',
    additionalProperties: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    },
  },
  example: {
    ko: {
      resource: {
        DASHBOARD: '대시보드',
      },
    },
    en: {
      resource: {
        DASHBOARD: 'Dashboard',
      },
    },
  },
})
export class TranslationListDataDto {
  [locale: string]: {
    [namespace: string]: {
      [key: string]: string
    }
  };
}

export class TranslationCreateDataDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: '생성된 번역 식별자' })
  id!: string;
}

export class TranslationUpdateDataDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: '수정된 번역 식별자' })
  id!: string;
}

export class TranslationDeleteDataDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: '삭제된 번역 식별자' })
  id!: string;
}

export class TranslationBulkDataDto {
  @ApiProperty({ example: 4, description: '처리된 번역 수' })
  processedCount!: number;
}
