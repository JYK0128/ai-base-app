import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsUUID, ValidateNested } from 'class-validator';

import { PayloadRequestDto } from '@/common/interfaces';

export class CreateTermsAgreementItemRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7083', type: String, description: '약관 버전 식별자' })
  @Type(() => String)
  @IsUUID()
  termsVersionId!: string;

  @ApiProperty({ example: true, type: Boolean, description: '동의 여부' })
  @Type(() => Boolean)
  @IsBoolean()
  agreed!: boolean;
}

export class CreateTermsAgreementRequestDto extends PayloadRequestDto {
  @ApiProperty({ example: [{ termsVersionId: '019e5236-adae-70d7-a8f7-2dc90bdf7083', agreed: true }, { termsVersionId: '019e5236-adae-70d7-a8f7-2dc90bdf7084', agreed: false }], type: CreateTermsAgreementItemRequestDto, isArray: true, description: '약관 버전별 동의 여부 목록' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateTermsAgreementItemRequestDto)
  terms!: CreateTermsAgreementItemRequestDto[];
}
