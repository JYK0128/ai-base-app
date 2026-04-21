import { Injectable, Logger } from '@nestjs/common';

import { AuthClient } from './auth.client';
import { AuthRefreshResponseDto, AuthTokenResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/auth-request.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authClient: AuthClient) {}

  async login(loginDto: LoginDto): Promise<AuthTokenResponseDto> {
    this.logger.log(`Handling login for ${loginDto.email}`);
    return this.authClient.login(loginDto);
  }

  async refresh(refreshToken: string): Promise<AuthRefreshResponseDto> {
    this.logger.log('Handling token refresh');
    return this.authClient.refresh(refreshToken);
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`Handling logout for ${userId}`);
    return this.authClient.logout(userId);
  }
}
