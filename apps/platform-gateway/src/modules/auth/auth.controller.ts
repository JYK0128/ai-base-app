import { Body, Controller, Get, Post, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';
import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

import { AuthClient } from './auth.client';
import { ChangePasswordDto, LoginDto } from './dto/auth-request.dto';
import { AuthMeResponseDto, AuthTokenResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authClient: AuthClient,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인', description: '로그인합니다.' })
  @SwaggerResult(AuthTokenResponseDto)
  @SwaggerResponse({ status: 401, description: '인증 실패', type: ApiResponse })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authClient.login(loginDto);

    res.cookie('refreshToken', refreshToken, createCookieOptions({
      maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
    }));

    return ApiResponse.success(
      { accessToken },
      '로그인에 성공했습니다.',
    );
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신', description: '액세스 토큰을 갱신합니다.' })
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
      res.cookie('refreshToken', newRefreshToken, createCookieOptions({
        maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
      }));
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
    description: '현재 관리자 정보를 조회합니다.',
  })
  @SwaggerResult(AuthMeResponseDto)
  @SwaggerResponse({ status: 401, description: '인증 실패', type: ApiResponse })
  async getMe() {
    const user = await this.authClient.me();
    return ApiResponse.success(
      { user },
      '관리자 정보를 성공적으로 가져왔습니다.',
    );
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '로그아웃합니다.' })
  @SwaggerResult()
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refreshToken');

    await this.authClient.logout();
    return ApiResponse.success(
      null,
      '로그아웃되었습니다.',
    );
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경 연장', description: '비밀번호 변경을 연장합니다.' })
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
  @ApiOperation({ summary: '비밀번호 변경', description: '비밀번호를 변경합니다.' })
  @SwaggerResult()
  @SwaggerResponse({ status: 400, description: '비밀번호 오류', type: ApiResponse })
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
