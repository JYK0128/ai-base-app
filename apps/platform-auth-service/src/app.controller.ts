import { Controller } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { LoginCommand } from './commands/impl/login.command';
import { GetUserInfoQuery } from './queries/impl/get-user-info.query';

@Controller()
export class AppController {
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
    console.log('Received auth event via RMQ:', data);
  }
}
