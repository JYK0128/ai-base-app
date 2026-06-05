import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { AUTH_SERVICE, AUTH_SERVICE_PATTERNS } from './auth.constants';
import { type ChangePasswordDto, LoginDto } from './dto/auth-request.dto';
import { type AuthMeUserDto } from './dto/auth-response.dto';

export interface LoginResult {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthClient extends CoreClient {
  constructor(
    @Inject(AUTH_SERVICE) client: ClientProxy,
    cls: ClsService,
  ) {
    super(client, cls);
  }

  async login(loginDto: LoginDto): Promise<LoginResult> {
    return this.send<LoginResult>(AUTH_SERVICE_PATTERNS.LOGIN, loginDto);
  }

  async refresh(refreshToken: string): Promise<LoginResult> {
    return this.send<LoginResult>(AUTH_SERVICE_PATTERNS.REFRESH, { refreshToken });
  }

  async logout(): Promise<void> {
    await this.send<void>(AUTH_SERVICE_PATTERNS.LOGOUT, {
      accountId: this.cls.get('accountId'),
    });
  }

  async deferPasswordChange(): Promise<void> {
    await this.send<void>(AUTH_SERVICE_PATTERNS.DEFER_PASSWORD_CHANGE, {
      accountId: this.cls.get('accountId'),
    });
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<void> {
    await this.send<void>(AUTH_SERVICE_PATTERNS.CHANGE_PASSWORD, {
      accountId: this.cls.get('accountId'),
      ...changePasswordDto,
    });
  }

  async me(): Promise<AuthMeUserDto> {
    return this.send<AuthMeUserDto>(AUTH_SERVICE_PATTERNS.ME, {});
  }
}
