import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken!: string;

  @ApiProperty({ description: '리프레시 토큰' })
  refreshToken!: string;

  @ApiProperty({ description: '활성 테넌트 ID', required: false })
  tenantId?: string;
}

export class AuthRefreshResponseDto {
  @ApiProperty({ description: '새로운 액세스 토큰' })
  accessToken!: string;

  @ApiProperty({ description: '새로운 리프레시 토큰 (발급된 경우)', required: false })
  refreshToken?: string;

  @ApiProperty({ description: '활성 테넌트 ID', required: false })
  tenantId?: string;
}

export class AuthPermissionsResponseDto {
  @ApiProperty({ description: '사용자 식별자' })
  userId!: string;

  @ApiProperty({ description: '이메일' })
  email!: string;

  @ApiProperty({ description: '활성 테넌트 ID', required: false })
  tenantId?: string;

  @ApiProperty({ description: '할당된 역할 코드 목록', type: [String] })
  roles!: string[];

  @ApiProperty({ description: '할당된 권한 코드 목록', type: [String] })
  permissions!: string[];
}
