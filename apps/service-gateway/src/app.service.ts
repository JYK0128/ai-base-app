import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';

import { type ExtendedRequest } from './common/types/request.type';

@Injectable({ scope: Scope.REQUEST }) // 요청 범위로 설정하여 requestId/traceId 접근 가능하게 함
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE') private client: ClientProxy,
    @Inject(REQUEST) private request: ExtendedRequest,
  ) {}

  sendAuthMessage() {
    const payload = {
      message: 'Hello from Gateway!',
      timestamp: new Date(),
      traceId: this.request.traceId, // traceId 전파
    };
    this.client.emit('auth_event', payload);
    return { status: 'Event emitted via RMQ', payload };
  }

  triggerLogin(userId: string, clientIp: string) {
    const payload = {
      userId,
      clientIp,
      traceId: this.request.traceId, // traceId 전파
    };
    // CQRS: Send a command
    return this.client.send('auth.login', payload);
  }

  getUserInfo() {
    const payload = {
      userId: 'user-123',
      traceId: this.request.traceId, // traceId 전파
    };
    // CQRS: Send a query
    return this.client.send('auth.get_user', payload);
  }
}
