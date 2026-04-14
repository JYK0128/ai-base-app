import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';

import { type ExtendedRequest } from '@/common/types/request.type';

@Injectable({ scope: Scope.REQUEST })
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    @Inject('AUTH_SERVICE') private client: ClientProxy,
    @Inject(REQUEST) private request: ExtendedRequest,
  ) {}

  getHello(): string {
    const payload = {
      message: 'Hello from Gateway!',
      timestamp: new Date(),
      traceId: this.request.traceId,
    };
    this.client.emit('auth_event', payload);
    return 'Hello from Gateway API!';
  }

  async login(data: { userId: string, clientIp: string }) {
    this.logger.log(`Forwarding login for ${data.userId} to Auth Service`);
    const payload = {
      ...data,
      traceId: this.request.traceId,
    };
    return this.client.send('auth.login', payload);
  }

  async getUser(userId: string) {
    this.logger.log(`Forwarding getUser for ${userId} to Auth Service`);
    const payload = {
      userId,
      traceId: this.request.traceId,
    };
    return this.client.send('auth.get_user', payload);
  }
}
