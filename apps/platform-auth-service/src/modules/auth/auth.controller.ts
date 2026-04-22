import { Controller, Logger } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { LoginCommand } from './commands/login.handler';
import { LogoutCommand } from './commands/logout.handler';
import { RefreshTokenCommand } from './commands/refresh-token.handler';
import { DeferPasswordChangeCommand } from './commands/defer-password-change.handler';
import { ChangePasswordCommand } from './commands/change-password.handler';
import { AuthNotifiedEvent } from './events/auth-notified.handler';
import { GetPermissionsQuery } from './queries/get-permissions.handler';
import { ValidateSessionQuery } from './queries/validate-session.handler';

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
  async handleLogout(@Payload() data: { userId: string }) {
    return this.commandBus.execute(new LogoutCommand(data.userId));
  }

  @MessagePattern('auth.defer_password_change')
  async handleDeferPasswordChange(@Payload() data: { userId: string }) {
    return this.commandBus.execute(new DeferPasswordChangeCommand(data.userId));
  }

  @MessagePattern('auth.change_password')
  async handleChangePassword(@Payload() data: { userId: string, currentPassword: string, newPassword: string }) {
    return this.commandBus.execute(
      new ChangePasswordCommand(data.userId, data.currentPassword, data.newPassword),
    );
  }

  @MessagePattern('auth.permissions')
  async handlePermissions(
    @Payload() data: {
      userId: string
      tenantId?: string
    },
  ) {
    return this.queryBus.execute(
      new GetPermissionsQuery(data.userId, data.tenantId),
    );
  }

  @MessagePattern('auth.validate_session')
  async handleValidateSession(@Payload() data: { userId: string, sid: string }) {
    return this.queryBus.execute(
      new ValidateSessionQuery(data.userId, data.sid),
    );
  }

  @EventPattern('auth_event')
  handleAuthEvent(@Payload() data: Record<string, unknown>) {
    this.logger.log('Received external auth event via RMQ. Broadcasting internally...');
    this.eventBus.publish(new AuthNotifiedEvent(data));
  }
}
