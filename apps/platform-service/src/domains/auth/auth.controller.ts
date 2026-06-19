import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { SwaggerResponse } from '@/common/decorators';
import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

import { CreateTermsAgreementContract } from '../terms/agree-terms/agree-terms.contract';
import { CreateTermsAgreementRequestDto } from '../terms/agree-terms/agree-terms.request.dto';
import { CreateTermsAgreementResponseDto } from '../terms/agree-terms/agree-terms.response.dto';
import { AuthChangePasswordContract } from './change-password/change-password.contract';
import { AuthChangePasswordRequestDto } from './change-password/change-password.request.dto';
import { AuthDeferPasswordChangeContract } from './defer-password-change/defer-password-change.contract';
import { AuthLoginContract } from './login/login.contract';
import { AuthLoginResponseDto } from './login/login.response.dto';
import { AuthLoginBodyRequestDto } from './login/login-body.request.dto';
import { AuthGetMeContract } from './me/get-me.contract';
import { AuthGetMeResponseDto } from './me/get-me.response.dto';
import { AuthRefreshTokenContract } from './refresh-token/refresh-token.contract';
import { AuthRefreshTokenResponseDto } from './refresh-token/refresh-token.response.dto';
import { GetActiveTermsContract } from './terms/get-active-terms.contract';
import { GetPendingTermsAgreementResponseDto } from './terms/get-pending-terms.response.dto';

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
  @SwaggerResponse(AuthLoginResponseDto)
  async login(
    @Body() body: AuthLoginBodyRequestDto,
    @Req() request: { ip?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthLoginResponseDto> {
    const clientIp = this.cls.get('clientIp') ?? request.ip ?? '0.0.0.0';
    const tokens = await this.commandBus.execute<AuthLoginContract, AuthLoginResponseDto>(new AuthLoginContract({
      ...body,
      clientIp,
    }));

    if (tokens.refreshToken) {
      res.cookie('refreshToken', tokens.refreshToken, createCookieOptions({
        maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
      }));
    }

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Public()
  @Post('refresh')
  @SwaggerResponse(AuthRefreshTokenResponseDto)
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthRefreshTokenResponseDto> {
    const { accessToken, refreshToken: newRefreshToken }
      = await this.commandBus.execute(new AuthRefreshTokenContract({ refreshToken }));

    res.cookie('refreshToken', newRefreshToken, createCookieOptions({
      maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
    }));

    return { accessToken };
  }

  @Get('me')
  @Bypass(BYPASS_POLICIES.TERMS)
  @SwaggerResponse(AuthGetMeResponseDto)
  async me(): Promise<AuthGetMeResponseDto> {
    return this.queryBus.execute(new AuthGetMeContract());
  }

  @Get('terms')
  @Bypass(BYPASS_POLICIES.TERMS)
  @SwaggerResponse([GetPendingTermsAgreementResponseDto])
  async getTerms(): Promise<GetPendingTermsAgreementResponseDto[]> {
    return this.queryBus.execute(new GetActiveTermsContract());
  }

  @Bypass(BYPASS_POLICIES.TERMS)
  @Post('terms/agreements')
  @SwaggerResponse([CreateTermsAgreementResponseDto])
  async agreeTerms(
    @Body() body: CreateTermsAgreementRequestDto,
  ): Promise<CreateTermsAgreementResponseDto[]> {
    return this.commandBus.execute(new CreateTermsAgreementContract(body));
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/change')
  @SwaggerResponse()
  async changePassword(
    @Body() body: AuthChangePasswordRequestDto,
  ): Promise<void> {
    await this.commandBus.execute(new AuthChangePasswordContract(body));
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  @SwaggerResponse()
  async deferPasswordChange(): Promise<void> {
    await this.commandBus.execute(new AuthDeferPasswordChangeContract());
  }
}
