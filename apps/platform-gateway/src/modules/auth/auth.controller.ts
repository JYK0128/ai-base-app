import { Body, Controller, Get, Post, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ENV } from '@/common/env';
import type { JWTPayload } from '@/common/types/request.type';
import { ApiResponse } from '@/common/types/response.type';

import { AuthClient } from './auth.client';
import { ChangePasswordDto, LoginDto } from './dto/auth-request.dto';
import { AuthMeResponseDto, AuthTokenResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authClient: AuthClient,
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
    const { accessToken, refreshToken } = await this.authClient.login(loginDto);

    this.setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(
      { accessToken },
      '로그인에 성공했습니다.',
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
      maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
    });
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

    const { accessToken, refreshToken: newRefreshToken } = await this.authClient.refresh(refreshToken);

    if (newRefreshToken) {
      this.setRefreshTokenCookie(res, newRefreshToken);
    }

    return ApiResponse.success(
      { accessToken },
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

  @Bypass(BYPASS_POLICIES.PASSWORD)
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

    await this.authClient.logout();
    return ApiResponse.success(
      null,
      '로그아웃되었습니다.',
    );
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경 연장', description: '비밀번호 변경 안내를 확인하고 90일 연장합니다.' })
  @SwaggerResult()
  async deferPasswordChange() {
    await this.authClient.deferPasswordChange();
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
    await this.authClient.changePassword(changePasswordDto);
    return ApiResponse.success(
      null,
      '비밀번호가 성공적으로 변경되었습니다.',
    );
  }
}
