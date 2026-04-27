import { Controller, Logger } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { ChangePasswordCommand } from './commands/change-password.handler';
import { DeferPasswordChangeCommand } from './commands/defer-password-change.handler';
import { LoginCommand } from './commands/login.handler';
import { LogoutCommand } from './commands/logout.handler';
import { RefreshTokenCommand } from './commands/refresh-token.handler';
import { AuthNotifiedEvent } from './events/auth-notified.handler';
import { GetPermissionsQuery } from './queries/get-permissions.handler';

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

  @MessagePattern('auth.refresh')
  async handleRefresh(@Payload() data: { refreshToken: string }) {
    return this.commandBus.execute(new RefreshTokenCommand(data.refreshToken));
  }

  @MessagePattern('auth.logout')
  async handleLogout(@Payload() data: { id: string }) {
    return this.commandBus.execute(new LogoutCommand(data.id));
  }

  @MessagePattern('auth.defer_password_change')
  async handleDeferPasswordChange(@Payload() data: { id: string }) {
    return this.commandBus.execute(new DeferPasswordChangeCommand(data.id));
  }

  @MessagePattern('auth.change_password')
  async handleChangePassword(@Payload() data: { id: string, currentPassword: string, newPassword: string }) {
    return this.commandBus.execute(
      new ChangePasswordCommand(data.id, data.currentPassword, data.newPassword),
    );
  }

  @MessagePattern('auth.permissions')
  async handlePermissions(
    @Payload() data: {
      id: string
      tenantId?: string
    },
  ) {
    return this.queryBus.execute(
      new GetPermissionsQuery(data.id, data.tenantId),
    );
  }

  @EventPattern('auth_event')
  handleAuthEvent(@Payload() data: Record<string, unknown>) {
    this.logger.log('Received external auth event via RMQ. Broadcasting internally...');
    this.eventBus.publish(new AuthNotifiedEvent(data));
  }
}
