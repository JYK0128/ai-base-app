import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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
