import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

import type { AuthMeUserInfo, ChangePasswordInput, DeferPasswordChangeInput, LoginInput, RefreshTokenInput } from './auth.types';
import { LoginUseCase } from './login/login.use-case';
import { GetMeUseCase } from './me/get-me.use-case';
import { ChangePasswordUseCase } from './password/change-password.use-case';
import { DeferPasswordChangeUseCase } from './password/defer-password-change.use-case';
import { RefreshTokenUseCase } from './refresh-token/refresh-token.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly cls: ClsService,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly deferPasswordChangeUseCase: DeferPasswordChangeUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: Omit<LoginInput, 'clientIp'>,
    @Req() request: { ip?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const clientIp = this.cls.get('clientIp') ?? request.ip ?? '0.0.0.0';
    const tokens = await this.loginUseCase.execute({
      ...body,
      clientIp,
    });

    res.cookie('refreshToken', tokens.refreshToken, createCookieOptions({
      maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
    }));

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken: newRefreshToken } = await this.refreshTokenUseCase.execute({
      refreshToken,
    } satisfies RefreshTokenInput);

    res.cookie('refreshToken', newRefreshToken, createCookieOptions({
      maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
    }));

    return {
      accessToken,
    };
  }

  @Get('me')
  async me(): Promise<AuthMeUserInfo> {
    return this.getMeUseCase.execute();
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/change')
  async changePassword(
    @Body() body: Omit<ChangePasswordInput, 'accountId'>,
  ): Promise<void> {
    await this.changePasswordUseCase.execute({
      accountId: this.cls.get('accountId'),
      ...body,
    });
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  async deferPasswordChange(): Promise<void> {
    await this.deferPasswordChangeUseCase.execute({
      accountId: this.cls.get('accountId'),
    } satisfies DeferPasswordChangeInput);
  }
}
