import { promisify } from 'node:util';

import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';

import { SwaggerResponse } from '@/common/decorators';
import { Bypass, BYPASS_POLICIES } from '@/common/decorators/bypass.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { generateCsrfToken } from '@/common/security/csrf';
import type { AppRequest } from '@/common/types/request.type';
import { createCookieOptions } from '@/common/utils/cookie';
import { ENV } from '@/env';

import { CreateTermsAgreementContract } from './agree-terms/agree-terms.contract';
import { CreateTermsAgreementRequestDto } from './agree-terms/agree-terms.request.dto';
import { CreateTermsAgreementResponseDto } from './agree-terms/agree-terms.response.dto';
import { AllowedResourceListContract } from './allowed-resource-list/allowed-resource-list.contract';
import { AllowedResourceListResponseDto } from './allowed-resource-list/allowed-resource-list.response.dto';
import { ChangePasswordContract } from './change-password/change-password.contract';
import { ChangePasswordRequestDto } from './change-password/change-password.request.dto';
import { CsrfResponseDto } from './csrf/csrf.response.dto';
import { DeferPasswordChangeContract } from './defer-password-change/defer-password-change.contract';
import { LoginContract } from './login/login.contract';
import { LoginRequestDto } from './login/login.request.dto';
import { LoginResponseDto } from './login/login.response.dto';
import { MeContract } from './me/me.contract';
import { MeResponseDto } from './me/me.response.dto';
import { PendingTermListContract } from './pending-term-list/pending-term-list.contract';
import { PendingTermListResponseDto } from './pending-term-list/pending-term-list.response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly cls: ClsService,
  ) {}

  @Public()
  @Get('csrf')
  @SwaggerResponse(CsrfResponseDto)
  async getCsrfToken(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CsrfResponseDto> {
    return {
      csrfToken: generateCsrfToken(req, res),
    };
  }

  @Public()
  @Bypass(BYPASS_POLICIES.TERMS)
  @Post('login')
  @SwaggerResponse(LoginResponseDto)
  async login(
    @Body() body: LoginRequestDto,
    @Req() req: AppRequest,
  ): Promise<LoginResponseDto> {
    const response = await this.commandBus.execute(new LoginContract(body));
    req.session.accountId = this.cls.get('account.id');
    return response;
  }

  @Public()
  @Post('logout')
  @SwaggerResponse()
  async logout(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await promisify(req.session.destroy.bind(req.session))();
    res.clearCookie(ENV.SESSION_COOKIE_NAME, createCookieOptions());
    res.clearCookie(ENV.CSRF_COOKIE_NAME, createCookieOptions());
  }

  @Get('me')
  @SwaggerResponse(MeResponseDto)
  async me(): Promise<MeResponseDto> {
    return this.queryBus.execute(new MeContract());
  }

  @Get('terms')
  @Bypass(BYPASS_POLICIES.TERMS)
  @SwaggerResponse(PendingTermListResponseDto)
  async getPendingTermList(): Promise<PendingTermListResponseDto> {
    return this.queryBus.execute(new PendingTermListContract());
  }

  @Get('resources')
  @SwaggerResponse(AllowedResourceListResponseDto)
  async getAllowedResourceList(): Promise<AllowedResourceListResponseDto> {
    return this.queryBus.execute(new AllowedResourceListContract());
  }

  @Bypass(BYPASS_POLICIES.TERMS)
  @Post('terms/agreements')
  @SwaggerResponse(CreateTermsAgreementResponseDto)
  async agreeTerms(
    @Body() body: CreateTermsAgreementRequestDto,
  ): Promise<CreateTermsAgreementResponseDto> {
    return this.commandBus.execute(new CreateTermsAgreementContract(body));
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/change')
  @SwaggerResponse()
  async changePassword(
    @Body() body: ChangePasswordRequestDto,
  ): Promise<void> {
    await this.commandBus.execute(new ChangePasswordContract(body));
  }

  @Bypass(BYPASS_POLICIES.PASSWORD)
  @Post('password/defer')
  @SwaggerResponse()
  async deferPasswordChange(): Promise<void> {
    await this.commandBus.execute(new DeferPasswordChangeContract());
  }
}
