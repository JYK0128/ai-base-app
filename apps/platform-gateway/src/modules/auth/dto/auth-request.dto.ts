import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

import { Match } from '@/common/decorators/match.decorator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: '관리자 이메일' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value?.trim().toLowerCase()
      : value,
  )
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email!: string;

  @ApiProperty({ example: 'password123', description: '비밀번호' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '현재 비밀번호' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ description: '새 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;

  @ApiProperty({ description: '새 비밀번호 확인' })
  @IsString()
  @IsNotEmpty()
  @Match('newPassword', { message: '비밀번호 확인이 일치하지 않습니다.' })
  confirmPassword!: string;
}

export class RegisterManagerDto extends LoginDto {
  @ApiProperty({ example: 'password123', description: '비밀번호 확인' })
  @IsNotEmpty({ message: '비밀번호 확인은 필수 입력 항목입니다.' })
  @Match('password', { message: '비밀번호 확인이 일치하지 않습니다.' })
  confirmPassword!: string;
}

export class VerifyManagerRegistrationDto {
  @ApiProperty({ description: '이메일 인증 토큰' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ResendManagerVerificationDto {
  @ApiProperty({ example: 'admin@example.com', description: '관리자 이메일' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value?.trim().toLowerCase()
      : value,
  )
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email!: string;
}

export class CreateOnboardingOrganizationDto {
  @ApiProperty({ example: 'Acme Inc.', description: '조직명' })
  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @ApiProperty({ example: 'acme', description: '조직 코드' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value?.trim().toLowerCase()
      : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: '조직 코드는 소문자, 숫자, 하이픈만 사용할 수 있습니다.' })
  organizationCode!: string;

  @ApiProperty({ example: 'admin@acme.example', description: '조직 대표 이메일' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value?.trim().toLowerCase()
      : value,
  )
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '조직 이메일은 필수 입력 항목입니다.' })
  organizationEmail!: string;
}
