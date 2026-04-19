import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { firstValueFrom } from 'rxjs';

import { LoginDto } from '../dto/login.dto';
import { AUTH_SERVICE_PATTERNS } from './auth-service.patterns';

@Injectable()
export class AuthServiceClient {
  private readonly logger = new Logger(AuthServiceClient.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  /**
   * 인증 마이크로서비스로 요청을 보낼 때 공통 메타데이터(traceId 등)를 주입합니다.
   */
  private send<TResult = unknown, TInput extends object = object>(pattern: string, data: TInput) {
    const payload = {
      ...data,
      traceId: this.cls.get('traceId'),
      clientIp: this.cls.get('ip'),
    };
    return firstValueFrom(this.client.send<TResult>(pattern, payload));
  }

  /**
   * 비동기 이벤트를 전송합니다.
   */
  private emit<TInput extends object = object>(pattern: string, data: TInput) {
    const payload = {
      ...data,
      traceId: this.cls.get('traceId'),
    };
    return this.client.emit(pattern, payload);
  }

  // --- 비즈니스 메서드 ---

  async login(loginDto: LoginDto) {
    this.logger.log(`Requesting login for ${loginDto.email}`);
    return this.send(AUTH_SERVICE_PATTERNS.LOGIN, loginDto);
  }

  async refresh(refreshToken: string) {
    this.logger.log('Requesting token refresh');
    return this.send(AUTH_SERVICE_PATTERNS.REFRESH, { refreshToken });
  }

  async logout(userId: string) {
    this.logger.log(`Requesting logout for ${userId}`);
    return this.send(AUTH_SERVICE_PATTERNS.LOGOUT, { userId });
  }

  async getUser(userId: string) {
    this.logger.log(`Requesting user info for ${userId}`);
    return this.send(AUTH_SERVICE_PATTERNS.GET_USER, { userId });
  }

  async sendWelcomeEvent(email: string) {
    return this.emit(AUTH_SERVICE_PATTERNS.AUTH_EVENT, {
      message: `Welcome, ${email}!`,
      timestamp: new Date(),
    });
  }
}
