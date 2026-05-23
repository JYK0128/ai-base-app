import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken!: string;
}

/**
 * 사용자 상세 정보 DTO
 */
export class AuthUserInfoDto {
  @ApiProperty({ description: '관리자 식별자' })
  id!: string;

  @ApiProperty({ description: '이메일 주소' })
  email!: string;

  @ApiProperty({ description: '관리자 상태' })
  status!: string;

  @ApiProperty({ description: '소속 조직 식별자', required: false })
  organizationId?: string;
}

/**
 * 내 정보 조회 응답 DTO
 */
export class AuthMeResponseDto {
  @ApiProperty({ description: '사용자 정보', type: AuthUserInfoDto })
  user!: AuthUserInfoDto;
}
