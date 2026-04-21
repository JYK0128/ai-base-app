import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken!: string;

  @ApiProperty({ description: '리프레시 토큰' })
  refreshToken!: string;
}

export class AuthRefreshResponseDto {
  @ApiProperty({ description: '새로운 액세스 토큰' })
  accessToken!: string;

  @ApiProperty({ description: '새로운 리프레시 토큰 (발급된 경우)', required: false })
  refreshToken?: string;
}
