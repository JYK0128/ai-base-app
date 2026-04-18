import { Injectable, Logger } from '@nestjs/common';

import { AuthServiceClient } from './clients/auth-service.client';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(private readonly authClient: AuthServiceClient) {}

  getHello(): string {
    void this.authClient.sendWelcomeEvent('anonymous');
    return 'Hello from Gateway API!';
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Handling login for ${loginDto.email}`);
    return this.authClient.login(loginDto);
  }

  async getUser(userId: string) {
    this.logger.log(`Handling getUser for ${userId}`);
    return this.authClient.getUser(userId);
  }
}
