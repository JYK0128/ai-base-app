import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { firstValueFrom } from 'rxjs';

import { AUTH_SERVICE, AUTH_SERVICE_PATTERNS } from './auth.constants';
import { LoginDto } from './dto/auth-request.dto';
import { AuthPermissionsResponseDto, AuthRefreshResponseDto, AuthTokenResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthClient {
  private readonly logger = new Logger(AuthClient.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  /**
   * 인증 마이크로서비스로 요청을 보낼 때 공통 메타데이터(traceId 등)를 주입합니다.
   */
  private send<TResult = unknown, TInput extends object = object>(pattern: string, data: TInput) {
    const tenantId = this.cls.get('tenantId');
    const payload = {
      ...data,
      traceId: this.cls.get('traceId'),
      clientIp: this.cls.get('ip'),
      ...(tenantId ? { tenantId } : {}),
    };
    return firstValueFrom(this.client.send<TResult>(pattern, payload));
  }

  // --- 비즈니스 메서드 ---

  async login(loginDto: LoginDto): Promise<AuthTokenResponseDto> {
    this.logger.log(`Requesting login for ${loginDto.email}`);
    return this.send<AuthTokenResponseDto>(AUTH_SERVICE_PATTERNS.LOGIN, loginDto);
  }

  async refresh(refreshToken: string): Promise<AuthRefreshResponseDto> {
    this.logger.log('Requesting token refresh');
    return this.send<AuthRefreshResponseDto>(AUTH_SERVICE_PATTERNS.REFRESH, { refreshToken });
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`Requesting logout for ${userId}`);
    await this.send<void>(AUTH_SERVICE_PATTERNS.LOGOUT, { userId });
  }

  async permissions(user: { sub: string, email: string, tenantId?: string }): Promise<AuthPermissionsResponseDto> {
    this.logger.log(`Requesting permissions for ${user.sub}`);
    return this.send<AuthPermissionsResponseDto>(AUTH_SERVICE_PATTERNS.PERMISSIONS, {
      userId: user.sub,
      email: user.email,
      tenantId: user.tenantId,
    });
  }
}
