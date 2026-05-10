import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken!: string;

  @ApiProperty({ description: '조직 생성 온보딩 필요 여부', required: false })
  mustCreateOrganization?: boolean;
}

export class AuthPermissionsResponseDto {
  @ApiProperty({ description: '할당된 역할 코드 목록', type: [String] })
  roles!: string[];

  @ApiProperty({ description: '할당된 권한 코드 목록', type: [String] })
  permissions!: string[];
}

/**
 * 사용자 상세 정보 DTO
 */
export class AuthUserInfoDto {
  @ApiProperty({ description: '관리자 고유 ID' })
  id!: string;

  @ApiProperty({ description: '이메일 주소' })
  email!: string;

  @ApiProperty({ description: '관리자 상태 (ACTIVE, INACTIVE)' })
  status!: string;

  @ApiProperty({ description: '관리자 조직 ID', required: false })
  organizationId?: string;
}

/**
 * 내 정보 조회 응답 DTO
 */
export class AuthMeResponseDto {
  @ApiProperty({ description: '사용자 정보', type: AuthUserInfoDto })
  user!: AuthUserInfoDto;
}
