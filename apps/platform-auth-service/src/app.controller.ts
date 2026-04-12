import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('auth.login')
  handleLogin(@Payload() data: Record<string, unknown>) {
    return this.appService.login(data);
  }

  @MessagePattern('auth.validate')
  handleValidate(@Payload() data: Record<string, unknown>) {
    return this.appService.validateSession(data);
  }

  @EventPattern('auth_event')
  handleAuthEvent(@Payload() data: Record<string, unknown>) {
    console.log('Received auth event:', data);
  }
}
