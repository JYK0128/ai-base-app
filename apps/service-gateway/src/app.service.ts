import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  sendAuthMessage() {
    const payload = { message: 'Hello from Gateway!', timestamp: new Date() };
    this.client.emit('auth_event', payload);
    return { status: 'Event emitted', payload };
  }

  triggerLogin() {
    const payload = { userId: 'user-123', clientIp: '127.0.0.1' };
    return this.client.send('auth.login', payload);
  }
}
