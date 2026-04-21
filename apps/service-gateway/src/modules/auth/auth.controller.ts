import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { Cookies } from '@/common/decorators/cookies.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { JWTPayload } from '@/common/types/request.type';

import { AuthService } from './auth.service';
import { AuthTokenResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/auth-request.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인', description: '인증 서비스로 로그인 요청을 전달하고 Refresh Token을 쿠키에 설정합니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: AuthTokenResponseDto })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신', description: '쿠키의 리프레시 토큰을 사용하여 액세스 토큰을 갱신합니다.' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 존재하지 않습니다.');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh(refreshToken);

    if (newRefreshToken) {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return { accessToken };
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '세션을 종료하고 리프레시 토큰 쿠키를 제거합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return this.authService.logout(req.user!.sub);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: '내 정보 조회',
    description: 'JWT 토큰을 통해 인증된 현재 사용자의 정보를 반환합니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getMe(@CurrentUser() user: JWTPayload) {
    return {
      message: '사용자 정보를 성공적으로 가져왔습니다.',
      user,
    };
  }
}
