import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    @Inject('AUTH_SERVICE') private client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  getHello(): string {
    const payload = {
      message: 'Hello from Gateway!',
      timestamp: new Date(),
      traceId: this.cls.get('traceId'),
    };
    this.client.emit('auth_event', payload);
    return 'Hello from Gateway API!';
  }

  async login(data: { email: string, password: string }) {
    this.logger.log(`Forwarding login for ${data.email} to Auth Service`);
    const payload = {
      ...data,
      clientIp: this.cls.get('ip'),
      traceId: this.cls.get('traceId'),
    };
    return this.client.send('auth.login', payload);
  }

  async getUser(userId: string) {
    this.logger.log(`Forwarding getUser for ${userId} to Auth Service`);
    const payload = {
      userId,
      traceId: this.cls.get('traceId'),
    };
    return this.client.send('auth.get_user', payload);
  }
}
