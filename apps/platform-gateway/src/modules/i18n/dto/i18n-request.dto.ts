import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';

export class TranslationsQueryDto {
  @ApiPropertyOptional({ example: 'DASHBOARD,ROLE_RESOURCE_CREATE_BUTTON', description: '조회할 번역 키 목록' })
  @IsOptional()
  @IsString()
  keys?: string;

  @ApiPropertyOptional({ example: 'resource', description: '선택 조회할 네임스페이스' })
  @IsOptional()
  @IsString()
  namespace?: string;

  @ApiPropertyOptional({ example: 'en', description: '배치 조회할 로케일' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class TranslationQueryDto {
  @ApiPropertyOptional({ example: 'en', description: '단건 조회할 로케일' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class TranslationParamDto {
  @ApiProperty({ example: 'resource', description: '번역 네임스페이스' })
  @IsString()
  namespace!: string;

  @ApiProperty({ example: 'DASHBOARD', description: '번역 키' })
  @IsString()
  key!: string;
}

export class TranslationCreateDto {
  @ApiProperty({ example: 'resource', description: '번역 네임스페이스' })
  @IsString()
  namespace!: string;

  @ApiProperty({ example: 'ROLE_RESOURCE_CREATE_BUTTON', description: '번역 키' })
  @IsString()
  key!: string;

  @ApiProperty({ example: 'ko', description: '번역 로케일' })
  @IsString()
  locale!: string;

  @ApiProperty({ example: '메뉴 추가', description: '번역 값' })
  @IsString()
  value!: string;
}

export class TranslationUpdateDto {
  @ApiProperty({ example: 'resource', description: '번역 네임스페이스' })
  @IsString()
  namespace!: string;

  @ApiProperty({ example: 'ROLE_RESOURCE_CREATE_BUTTON', description: '번역 키' })
  @IsString()
  key!: string;

  @ApiProperty({ example: 'ko', description: '번역 로케일' })
  @IsString()
  locale!: string;

  @ApiProperty({ example: '메뉴 추가', description: '번역 값' })
  @IsString()
  value!: string;
}

export class TranslationDeleteDto {
  @ApiProperty({ example: 'resource', description: '번역 네임스페이스' })
  @IsString()
  namespace!: string;

  @ApiProperty({ example: 'ROLE_RESOURCE_CREATE_BUTTON', description: '번역 키' })
  @IsString()
  key!: string;

  @ApiProperty({ example: 'ko', description: '번역 로케일' })
  @IsString()
  locale!: string;
}

export class TranslationBulkOperationDto {
  @ApiProperty({ enum: ['CREATE', 'UPDATE', 'DELETE'], example: 'UPDATE', description: '처리 유형' })
  @IsString()
  @IsIn(['CREATE', 'UPDATE', 'DELETE'])
  action!: 'CREATE' | 'UPDATE' | 'DELETE';

  @ApiProperty({ example: 'resource', description: '번역 네임스페이스' })
  @IsString()
  namespace!: string;

  @ApiProperty({ example: 'ROLE_RESOURCE_CREATE_BUTTON', description: '번역 키' })
  @IsString()
  key!: string;

  @ApiProperty({ example: 'ko', description: '번역 로케일' })
  @IsString()
  locale!: string;

  @ApiPropertyOptional({ example: '메뉴 추가', description: '번역 값' })
  @IsOptional()
  @IsString()
  value?: string;
}

export class TranslationBulkDto {
  @ApiProperty({ type: [TranslationBulkOperationDto], description: '번역 처리 목록' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TranslationBulkOperationDto)
  operations!: TranslationBulkOperationDto[];
}
