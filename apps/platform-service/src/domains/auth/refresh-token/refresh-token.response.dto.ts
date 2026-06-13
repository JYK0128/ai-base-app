import { ApiProperty } from '@nestjs/swagger';

import { withPayloadResponseDto } from '@/common/interfaces';

export class RefreshTokenResponseDto extends withPayloadResponseDto() {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: '액세스 토큰' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: '리프레시 토큰' })
  refreshToken!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '사용자/계정 식별자' })
  id!: string;
}
