import { Body, Controller, Get, Post, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import type { JWTPayload } from '@/common/types/request.type';
import { ApiResponse } from '@/common/types/response.type';

import { AuthService } from './auth.service';
import { ChangePasswordDto, CreateOnboardingOrganizationDto, LoginDto, RegisterManagerDto, ResendManagerVerificationDto, VerifyManagerRegistrationDto } from './dto/auth-request.dto';
import { AuthMeResponseDto, AuthPermissionsResponseDto, AuthTokenResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cls: ClsService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인', description: '인증 서비스로 로그인 요청을 전달하고 Refresh Token을 쿠키에 설정합니다.' })
  @SwaggerResult(AuthTokenResponseDto)
  @SwaggerResponse({ status: 401, description: '인증 실패 또는 비밀번호 변경 필요', type: ApiResponse })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, mustCreateOrganization } = await this.authService.login(loginDto);

    this.setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(
      { accessToken, mustCreateOrganization },
      '로그인에 성공했습니다.',
    );
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '관리자 공개가입', description: '조직 없이 관리자 인증 계정을 생성하고 이메일 인증을 요청합니다.' })
  @SwaggerResult()
  @SwaggerResponse({ status: 409, description: '이미 가입된 이메일', type: ApiResponse })
  async register(@Body() registerDto: RegisterManagerDto) {
    await this.authService.register(registerDto);
    return ApiResponse.success(
      null,
      '인증 메일이 발송되었습니다.',
    );
  }

  @Public()
  @Post('register/verify')
  @ApiOperation({ summary: '관리자 가입 이메일 인증', description: '이메일 인증 토큰을 검증하고 계정을 활성화합니다.' })
  @SwaggerResult()
  async verifyRegistration(@Body() verifyDto: VerifyManagerRegistrationDto) {
    await this.authService.verifyRegistration(verifyDto);
    return ApiResponse.success(
      null,
      '이메일 인증이 완료되었습니다.',
    );
  }

  @Public()
  @Post('register/resend')
  @ApiOperation({ summary: '관리자 가입 인증 메일 재발송', description: '미인증 계정의 인증 메일을 다시 발송합니다.' })
  @SwaggerResult()
  async resendRegistrationVerification(@Body() resendDto: ResendManagerVerificationDto) {
    await this.authService.resendVerification(resendDto);
    return ApiResponse.success(
      null,
      '인증 메일이 발송되었습니다.',
    );
  }

  /**
   * Refresh Token 쿠키 설정 공통 함수
   */
  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Get('permissions')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '권한 조회',
    description: '현재 인증된 관리자 계정과 테넌트 기준으로 역할과 권한 목록을 반환합니다.',
  })
  @SwaggerResult(AuthPermissionsResponseDto)
  async permissions() {
    return this.authService.permissions();
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신', description: '쿠키의 리프레시 토큰을 사용하여 액세스 토큰을 갱신합니다.' })
  @SwaggerResult(AuthTokenResponseDto)
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 존재하지 않습니다.');
    }

    const { accessToken, refreshToken: newRefreshToken, mustCreateOrganization } = await this.authService.refresh(refreshToken);

    if (newRefreshToken) {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return ApiResponse.success(
      { accessToken, mustCreateOrganization },
      '토큰이 성공적으로 갱신되었습니다.',
    );
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 정보 조회',
    description: 'JWT 토큰을 통해 인증된 현재 관리자 계정의 정보를 반환합니다.',
  })
  @SwaggerResult(AuthMeResponseDto)
  @SwaggerResponse({ status: 401, description: '인증 실패', type: ApiResponse })
  getMe(@CurrentUser() user: JWTPayload) {
    return ApiResponse.success(
      { user },
      '관리자 정보를 성공적으로 가져왔습니다.',
    );
  }

  @Bypass(BYPASS_POLICIES.PASSWORD, BYPASS_POLICIES.ONBOARDING)
  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '세션을 종료하고 리프레시 토큰 쿠키를 제거합니다.' })
  @SwaggerResult()
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    await this.authService.logout();
    return ApiResponse.success(
      null,
      '로그아웃되었습니다.',
    );
  }

  @Bypass(BYPASS_POLICIES.ONBOARDING)
  @Post('onboarding/organization')
  @ApiBearerAuth()
  @ApiOperation({ summary: '최초 로그인 조직 생성', description: '조직 생성 온보딩 토큰으로 조직을 생성하고 일반 토큰을 발급합니다.' })
  @SwaggerResult(AuthTokenResponseDto)
  async createOnboardingOrganization(
    @Body() dto: CreateOnboardingOrganizationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, mustCreateOrganization } = await this.authService.createOnboardingOrganization(dto);

    this.setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(
      { accessToken, mustCreateOrganization },
      '조직 생성이 완료되었습니다.',
    );
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경 연장', description: '비밀번호 변경 안내를 확인하고 90일 연장합니다.' })
  @SwaggerResult()
  async deferPasswordChange() {
    await this.authService.deferPasswordChange();
    return ApiResponse.success(
      null,
      '비밀번호 변경 안내가 90일 연장되었습니다.',
    );
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/change')
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경', description: '현재 비밀번호를 확인하고 새로운 비밀번호로 변경합니다.' })
  @SwaggerResult()
  @SwaggerResponse({ status: 400, description: '비밀번호 규칙 위반 또는 현재 비밀번호 불일치', type: ApiResponse })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(changePasswordDto);
    return ApiResponse.success(
      null,
      '비밀번호가 성공적으로 변경되었습니다.',
    );
  }
}
