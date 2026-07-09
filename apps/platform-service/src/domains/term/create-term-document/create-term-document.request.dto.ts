import { ApiProperty } from '@nestjs/swagger';
import { TermsDocumentScope } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';

export class CreateTermDocumentRequestDto {
  @ApiProperty({ example: 'SERVICE_TOS', type: String, description: '약관 코드' })
  @Type(() => String)
  @IsNotEmptyString({ message: '약관 코드를 입력해주세요.' })
  code!: string;

  @ApiProperty({ example: '서비스 이용약관', type: String, description: '약관 제목' })
  @Type(() => String)
  @IsNotEmptyString({ message: '약관 제목을 입력해주세요.' })
  title!: string;

  @ApiProperty({ example: true, type: Boolean, description: '필수 동의 여부' })
  @Type(() => Boolean)
  @IsBoolean()
  required!: boolean;

  @ApiProperty({ example: TermsDocumentScope.PLATFORM, enum: TermsDocumentScope, description: '적용 범위' })
  @Type(() => String)
  @IsEnum(TermsDocumentScope)
  scope!: TermsDocumentScope;
}
