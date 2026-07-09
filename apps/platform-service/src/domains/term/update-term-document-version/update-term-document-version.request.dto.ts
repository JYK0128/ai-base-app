import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TermsVersion, TermsVersionStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsUUID } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators';
import { EntityRequestType } from '@/common/interfaces';

export class UpdateTermDocumentVersionRequestDto extends EntityRequestType(TermsVersion) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', type: String, description: '리소스 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiPropertyOptional({ example: 'v1.0.0', type: String, description: '버전 라벨' })
  @Type(() => String)
  @IsNotEmptyString({ message: '버전 라벨을 입력해주세요.' })
  override label?: string;

  @ApiPropertyOptional({ example: '2026-06-06T14:00:00.000Z', type: String, description: '효력 일시' })
  @Type(() => Date)
  @IsDate()
  override effectiveAt?: Date;

  @ApiPropertyOptional({ example: TermsVersionStatus.PUBLISHED, enum: TermsVersionStatus, description: '버전 상태' })
  @Type(() => String)
  @IsEnum(TermsVersionStatus)
  override status?: TermsVersionStatus;

  @ApiPropertyOptional({ example: '약관 본문 내용입니다...', type: String, description: '약관 본문' })
  @Type(() => String)
  @IsNotEmptyString({ message: '약관 본문을 입력해주세요.' })
  override content?: string;

  @ApiPropertyOptional({ example: '표현을 명확하게 다듬었습니다.', type: String, description: '개정 요약' })
  @Type(() => String)
  summary?: string;

  @ApiPropertyOptional({ example: '약관 전체 문구를 정비했습니다.', type: String, description: '변경 사유' })
  @Type(() => String)
  reason?: string;
}
