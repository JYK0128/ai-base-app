import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, MinLength } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import { PayloadRequestDto } from '@/common/interfaces';

export class LoginRequestDto extends PayloadRequestDto {
  @ApiProperty({ example: 'dev@example.com', description: '이메일 주소' })
  @Type(() => String)
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email!: string;

  @ApiProperty({ example: '비밀번호123!', description: '비밀번호' })
  @Type(() => String)
  @IsNotEmptyString({ message: '비밀번호는 필수 입력 항목입니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password!: string;
}
