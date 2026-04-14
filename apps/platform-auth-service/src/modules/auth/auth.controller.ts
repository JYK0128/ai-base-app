import { Controller } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { LoginCommand } from './commands/login.handler';
import { AuthNotifiedEvent } from './events/auth-notified.handler';
import { GetUserInfoQuery } from './queries/get-user-info.handler';

@Controller()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  @MessagePattern('auth.login')
  async handleLogin(@Payload() data: { userId: string, clientIp: string }) {
    return this.commandBus.execute(
      new LoginCommand(data.userId, data.clientIp),
    );
  }

  @MessagePattern('auth.get_user')
  async handleGetUser(@Payload() data: { userId: string }) {
    return this.queryBus.execute(new GetUserInfoQuery(data.userId));
  }

  @EventPattern('auth_event')
  handleAuthEvent(@Payload() data: Record<string, unknown>) {
    console.log('Received external auth event via RMQ. Broadcasting internally...');
    this.eventBus.publish(new AuthNotifiedEvent(data));
  }
}
