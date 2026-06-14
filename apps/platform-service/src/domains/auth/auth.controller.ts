import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

import { ChangePasswordContract } from './change-password/change-password.contract';
import { ChangePasswordRequestDto } from './change-password/change-password.request.dto';
import { DeferPasswordChangeContract } from './defer-password-change/defer-password-change.contract';
import { LoginContract } from './login/login.contract';
import { LoginRequestDto } from './login/login.request.dto';
import { LoginResponseDto } from './login/login.response.dto';
import { GetMeContract } from './me/get-me.contract';
import { GetMeResponseDto } from './me/get-me.response.dto';
import { RefreshTokenContract } from './refresh-token/refresh-token.contract';
import { RefreshTokenRequestDto } from './refresh-token/refresh-token.request.dto';
import { RefreshTokenResponseDto } from './refresh-token/refresh-token.response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly cls: ClsService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Bypass(BYPASS_POLICIES.TERMS)
  @Post('login')
  async login(
    @Body() body: Omit<LoginRequestDto, 'clientIp'>,
    @Req() request: { ip?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<Pick<LoginResponseDto, 'accessToken'>> {
    const clientIp = this.cls.get('clientIp') ?? request.ip ?? '0.0.0.0';
    const tokens = await this.commandBus.execute<LoginContract, LoginResponseDto>(new LoginContract({
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
    const { accessToken, refreshToken: newRefreshToken } = await this.commandBus.execute<RefreshTokenContract, RefreshTokenResponseDto>(new RefreshTokenContract({
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
  @Bypass(BYPASS_POLICIES.TERMS)
  async me(): Promise<GetMeResponseDto> {
    return this.queryBus.execute<GetMeContract, GetMeResponseDto>(new GetMeContract());
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/change')
  async changePassword(
    @Body() body: ChangePasswordRequestDto,
  ): Promise<void> {
    await this.commandBus.execute(new ChangePasswordContract(body));
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  async deferPasswordChange(): Promise<void> {
    await this.commandBus.execute(new DeferPasswordChangeContract());
  }
}
