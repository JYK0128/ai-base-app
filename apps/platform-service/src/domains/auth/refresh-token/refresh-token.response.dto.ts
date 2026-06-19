import { ApiProperty } from '@nestjs/swagger';

import type { PayloadResponseDto } from '@/common/interfaces';
export class AuthRefreshTokenResponseDto implements PayloadResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: '액세스 토큰' })
  accessToken!: string;
}
