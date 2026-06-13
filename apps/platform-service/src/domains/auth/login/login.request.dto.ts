import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIP, IsOptional, MinLength } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import { withPayloadRequestDto } from '@/common/interfaces';

export class LoginRequestDto extends withPayloadRequestDto() {
  @ApiProperty({ example: 'dev@example.com', description: '이메일 주소' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email!: string;

  @ApiProperty({ example: '비밀번호123!', description: '비밀번호' })
  @IsNotEmptyString({ message: '비밀번호는 필수 입력 항목입니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password!: string;

  @ApiPropertyOptional({ example: '127.0.0.1', description: '클라이언트 IP' })
  @IsOptional()
  @IsIP()
  clientIp?: string;
}
