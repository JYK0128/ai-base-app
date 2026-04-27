import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken!: string;
}

export class AuthPermissionsResponseDto {
  @ApiProperty({ description: '할당된 역할 코드 목록', type: [String] })
  roles!: string[];

  @ApiProperty({ description: '할당된 권한 코드 목록', type: [String] })
  permissions!: string[];
}
