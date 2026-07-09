import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsUUID, MinLength, ValidateNested } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import { PayloadRequestDto } from '@/common/interfaces';

export class AcceptJoinTermRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', type: String, description: '약관 버전 식별자' })
  @Type(() => String)
  @IsUUID()
  termsVersionId!: string;

  @ApiProperty({ example: true, type: Boolean, description: '동의 여부' })
  @Type(() => Boolean)
  @IsBoolean()
  agreed!: boolean;
}

export class AcceptJoinProfileRequestDto {
  @ApiProperty({ example: '김개발', type: String, description: '가입자 이름' })
  @Type(() => String)
  @IsNotEmptyString({ message: '이름은 공백만으로 구성될 수 없습니다.' })
  name!: string;

  @ApiProperty({ example: 'dev@example.com', type: String, description: '가입 이메일' })
  @Type(() => String)
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, description: '비밀번호' })
  @Type(() => String)
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password!: string;
}

export class AcceptJoinRequestDto extends PayloadRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', type: String, description: '초대 토큰' })
  @Type(() => String)
  @IsUUID()
  token!: string;

  @ApiProperty({ example: { name: '김개발', email: 'dev@example.com' }, type: AcceptJoinProfileRequestDto, description: '가입정보' })
  @ValidateNested()
  @Type(() => AcceptJoinProfileRequestDto)
  profile!: AcceptJoinProfileRequestDto;

  @ApiProperty({ example: [{ termsVersionId: '019e5236-adae-70d7-a8f7-2dc90bdf7082', agreed: true }], type: () => [AcceptJoinTermRequestDto], description: '약관 동의 목록' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AcceptJoinTermRequestDto)
  terms!: AcceptJoinTermRequestDto[];
}
