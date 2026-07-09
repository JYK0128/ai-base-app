import { ApiProperty } from '@nestjs/swagger';
import { TermsVersion, TermsVersionStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsDate, IsEnum } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import { EntityRequestType } from '@/common/interfaces';

export class CreateTermDocumentVersionRequestDto extends EntityRequestType(TermsVersion) {
  @ApiProperty({ example: 'v1.0.0', type: String, description: '버전 라벨' })
  @Type(() => String)
  @IsNotEmptyString({ message: '버전 라벨을 입력해주세요.' })
  override label!: string;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', type: String, description: '효력 일시' })
  @Type(() => Date)
  @IsDate()
  override effectiveAt!: Date;

  @ApiProperty({ example: TermsVersionStatus.PUBLISHED, enum: TermsVersionStatus, description: '버전 상태' })
  @Type(() => String)
  @IsEnum(TermsVersionStatus)
  override status!: TermsVersionStatus;

  @ApiProperty({ example: '약관 본문 내용입니다...', type: String, description: '약관 본문' })
  @Type(() => String)
  @IsNotEmptyString({ message: '약관 본문을 입력해주세요.' })
  override content!: string;

  @ApiProperty({ example: '표현을 명확하게 다듬었습니다.', type: String, description: '개정 요약' })
  @Type(() => String)
  summary!: string;

  @ApiProperty({ example: '약관 전체 문구를 정비했습니다.', type: String, description: '변경 사유' })
  @Type(() => String)
  reason!: string;
}
