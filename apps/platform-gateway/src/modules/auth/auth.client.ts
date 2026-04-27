import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { firstValueFrom } from 'rxjs';

import { AUTH_SERVICE, AUTH_SERVICE_PATTERNS } from './auth.constants';
import { LoginResult } from './auth.service';
import { type ChangePasswordDto, LoginDto } from './dto/auth-request.dto';
import { AuthPermissionsResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthClient {
  constructor(
    @Inject(AUTH_SERVICE) private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  /**
   * 인증 마이크로서비스로 요청을 보낼 때 공통 메타데이터(traceId 등)를 주입합니다.
   */
  private send<TResult = unknown, TInput extends object = object>(pattern: string, data: TInput) {
    const payload = {
      ...data,
      traceId: this.cls.get('traceId'),
      sid: this.cls.get('sid'),
      clientIp: this.cls.get('clientIp'),
      id: this.cls.get('id'),
      tenantId: this.cls.get('tenantId'),
    };
    return firstValueFrom(this.client.send<TResult>(pattern, payload));
  }

  // --- 비즈니스 메서드 ---
  async login(loginDto: LoginDto): Promise<LoginResult> {
    return this.send<LoginResult>(AUTH_SERVICE_PATTERNS.LOGIN, loginDto);
  }

  async refresh(refreshToken: string): Promise<LoginResult> {
    return this.send<LoginResult>(AUTH_SERVICE_PATTERNS.REFRESH, { refreshToken });
  }

  async logout(): Promise<void> {
    await this.send<void>(AUTH_SERVICE_PATTERNS.LOGOUT, {});
  }

  async permissions(): Promise<AuthPermissionsResponseDto> {
    return this.send<AuthPermissionsResponseDto>(AUTH_SERVICE_PATTERNS.PERMISSIONS, {});
  }

  async deferPasswordChange(): Promise<void> {
    await this.send<void>(AUTH_SERVICE_PATTERNS.DEFER_PASSWORD_CHANGE, {});
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<void> {
    await this.send<void>(AUTH_SERVICE_PATTERNS.CHANGE_PASSWORD, changePasswordDto);
  }
}
