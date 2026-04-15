import { Controller, Logger } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { LoginCommand } from './commands/login.handler';
import { AuthNotifiedEvent } from './events/auth-notified.handler';
import { GetUserInfoQuery } from './queries/get-user-info.handler';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  @MessagePattern('auth.login')
  async handleLogin(@Payload() data: { email: string, password: string, clientIp: string }) {
    return this.commandBus.execute(
      new LoginCommand(data.email, data.password, data.clientIp),
    );
  }

  @MessagePattern('auth.get_user')
  async handleGetUser(@Payload() data: { userId: string }) {
    return this.queryBus.execute(new GetUserInfoQuery(data.userId));
  }

  @EventPattern('auth_event')
  handleAuthEvent(@Payload() data: Record<string, unknown>) {
    this.logger.log('Received external auth event via RMQ. Broadcasting internally...');
    this.eventBus.publish(new AuthNotifiedEvent(data));
  }
}
