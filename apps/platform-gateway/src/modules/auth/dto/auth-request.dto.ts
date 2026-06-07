import { ApiProperty } from '@nestjs/swagger';
import { MemberAccount } from '@pkg/database';
import { IsEmail, MinLength } from 'class-validator';

import { IsMatch } from '@/common/decorators/is-match.decorator';
import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import { IsNotMatch } from '@/common/decorators/is-not-match.decorator';

export class LoginDto implements Pick<MemberAccount, 'email'> {
  @ApiProperty({ example: 'dev@example.com', description: '이메일 주소' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email!: string;

  @ApiProperty({ example: '비밀번호123!', description: '비밀번호' })
  @IsNotEmptyString({ message: '비밀번호는 필수 입력 항목입니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '현재 비밀번호' })
  @IsNotEmptyString({ message: '현재 비밀번호는 필수 입력 항목입니다.' })
  currentPassword!: string;

  @ApiProperty({ description: '새 비밀번호' })
  @IsNotEmptyString({ message: '새 비밀번호는 필수 입력 항목입니다.' })
  @MinLength(6, { message: '새 비밀번호는 최소 6자 이상이어야 합니다.' })
  @IsNotMatch('currentPassword', { message: '새 비밀번호는 현재 비밀번호와 같을 수 없습니다.' })
  newPassword!: string;

  @ApiProperty({ description: '새 비밀번호 확인' })
  @IsNotEmptyString({ message: '새 비밀번호 확인은 필수 입력 항목입니다.' })
  @MinLength(6, { message: '새 비밀번호 확인은 최소 6자 이상이어야 합니다.' })
  @IsMatch('newPassword', { message: '비밀번호 확인이 일치하지 않습니다.' })
  confirmPassword!: string;
}
