import { ApiProperty } from '@nestjs/swagger';

import { type PayloadRequestDto } from '@/common/interfaces';

export class LoginResponseDto implements PayloadRequestDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: '액세스 토큰' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: '리프레시 토큰' })
  refreshToken!: string;
}
