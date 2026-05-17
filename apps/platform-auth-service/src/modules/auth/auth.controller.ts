import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ChangePasswordCommand,
         DeferPasswordChangeCommand,
         LoginCommand,
         LogoutCommand,
         RefreshTokenCommand } from './commands';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern('auth.login')
  async handleLogin(@Payload() data: { email: string, password: string, clientIp: string }) {
    return this.commandBus.execute(new LoginCommand(data.email, data.password, data.clientIp));
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
  async handleChangePassword(
    @Payload() data: { id: string, currentPassword: string, newPassword: string },
  ) {
    return this.commandBus.execute(
      new ChangePasswordCommand(data.id, data.currentPassword, data.newPassword),
    );
  }
}
