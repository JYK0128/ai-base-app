import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Cookies } from '@/common/decorators/cookies.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

import { CreateTermsAgreementContract } from '../terms/agreements/agree-terms.contract';
import { CreateTermsAgreementRequestDto } from '../terms/agreements/agree-terms.request.dto';
import type { CreateTermsAgreementResponseDto, GetTermsDocumentResponseDto } from '../terms/queries/get-terms-document.response.dto';
import { AuthChangePasswordContract } from './change-password/change-password.contract';
import { AuthChangePasswordRequestDto } from './change-password/change-password.request.dto';
import { AuthDeferPasswordChangeContract } from './defer-password-change/defer-password-change.contract';
import { AuthLoginContract } from './login/login.contract';
import { AuthLoginRequestDto } from './login/login.request.dto';
import { AuthLoginResponseDto } from './login/login.response.dto';
import { AuthGetMeContract } from './me/get-me.contract';
import { AuthGetMeResponseDto } from './me/get-me.response.dto';
import { AuthRefreshTokenContract } from './refresh-token/refresh-token.contract';
import { AuthRefreshTokenRequestDto } from './refresh-token/refresh-token.request.dto';
import { AuthRefreshTokenResponseDto } from './refresh-token/refresh-token.response.dto';
import { GetActiveTermsContract } from './terms/get-active-terms.contract';

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
    @Body() body: Omit<AuthLoginRequestDto, 'clientIp'>,
    @Req() request: { ip?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<Pick<AuthLoginResponseDto, 'accessToken'>> {
    const clientIp = this.cls.get('clientIp') ?? request.ip ?? '0.0.0.0';
    const tokens = await this.commandBus.execute<AuthLoginContract, AuthLoginResponseDto>(new AuthLoginContract({
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
  ): Promise<Pick<AuthRefreshTokenResponseDto, 'accessToken'>> {
    const { accessToken, refreshToken: newRefreshToken } = await this.commandBus.execute<AuthRefreshTokenContract, AuthRefreshTokenResponseDto>(new AuthRefreshTokenContract({
      refreshToken,
    } satisfies AuthRefreshTokenRequestDto));

    res.cookie('refreshToken', newRefreshToken, createCookieOptions({
      maxAge: ENV.JWT_REFRESH_EXPIRES_IN * 1000,
    }));

    return {
      accessToken,
    };
  }

  @Get('me')
  @Bypass(BYPASS_POLICIES.TERMS)
  async me(): Promise<AuthGetMeResponseDto> {
    return this.queryBus.execute<AuthGetMeContract, AuthGetMeResponseDto>(new AuthGetMeContract());
  }

  @Get('terms')
  @Bypass(BYPASS_POLICIES.TERMS)
  async getTerms(): Promise<GetTermsDocumentResponseDto[]> {
    return this.queryBus.execute<GetActiveTermsContract, GetTermsDocumentResponseDto[]>(new GetActiveTermsContract());
  }

  @Bypass(BYPASS_POLICIES.TERMS)
  @Post('terms/agreements')
  async agreeTerms(
    @Body() body: CreateTermsAgreementRequestDto,
  ): Promise<CreateTermsAgreementResponseDto> {
    return this.commandBus.execute(new CreateTermsAgreementContract(body));
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/change')
  async changePassword(
    @Body() body: AuthChangePasswordRequestDto,
  ): Promise<void> {
    await this.commandBus.execute(new AuthChangePasswordContract(body));
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  async deferPasswordChange(): Promise<void> {
    await this.commandBus.execute(new AuthDeferPasswordChangeContract());
  }
}
