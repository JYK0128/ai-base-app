import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

import { LoginCommand } from './login/login.command';
import type { LoginRequestDto } from './login/login.request.dto';
import type { LoginResponseDto } from './login/login.response.dto';
import { GetMeQuery } from './me/get-me.query';
import { GetMeResponseDto } from './me/get-me.response.dto';
import { ChangePasswordCommand } from './password/change-password.command';
import type { ChangePasswordRequestDto } from './password/change-password.request.dto';
import { DeferPasswordChangeCommand } from './password/defer-password-change.command';
import type { DeferPasswordChangeRequestDto } from './password/defer-password-change.request.dto';
import { RefreshTokenCommand } from './refresh-token/refresh-token.command';
import type { RefreshTokenRequestDto } from './refresh-token/refresh-token.request.dto';
import type { RefreshTokenResponseDto } from './refresh-token/refresh-token.response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly cls: ClsService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: Omit<LoginRequestDto, 'clientIp'>,
    @Req() request: { ip?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<Pick<LoginResponseDto, 'accessToken'>> {
    const clientIp = this.cls.get('clientIp') ?? request.ip ?? '0.0.0.0';
    const tokens = await this.commandBus.execute<LoginCommand, LoginResponseDto>(new LoginCommand({
      ...body,
      clientIp,
    }));

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
  ): Promise<Pick<RefreshTokenResponseDto, 'accessToken'>> {
    const { accessToken, refreshToken: newRefreshToken } = await this.commandBus.execute<RefreshTokenCommand, RefreshTokenResponseDto>(new RefreshTokenCommand({
      refreshToken,
    } satisfies RefreshTokenRequestDto));

    res.cookie('refreshToken', newRefreshToken, createCookieOptions({
      maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
    }));

    return {
      accessToken,
    };
  }

  @Get('me')
  async me(): Promise<GetMeResponseDto> {
    return this.queryBus.execute<GetMeQuery, GetMeResponseDto>(new GetMeQuery());
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/change')
  async changePassword(
    @Body() body: Omit<ChangePasswordRequestDto, 'accountId'>,
  ): Promise<void> {
    await this.commandBus.execute(new ChangePasswordCommand({
      accountId: this.cls.get('accountId'),
      ...body,
    } satisfies ChangePasswordRequestDto));
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  async deferPasswordChange(): Promise<void> {
    await this.commandBus.execute(new DeferPasswordChangeCommand({
      accountId: this.cls.get('accountId'),
    } satisfies DeferPasswordChangeRequestDto));
  }
}
