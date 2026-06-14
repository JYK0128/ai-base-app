import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import type { PayloadRequestDto } from '@/common/interfaces';

export class RefreshTokenRequestDto implements PayloadRequestDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: '리프레시 토큰' })
  @IsNotEmpty({ message: '리프레시 토큰은 필수 입력 항목입니다.' })
  refreshToken!: string;
}
