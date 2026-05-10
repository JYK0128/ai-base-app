import { Controller, Logger } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { ChangePasswordCommand } from './commands/change-password.handler';
import { CreateOnboardingOrganizationCommand } from './commands/create-onboarding-organization.handler';
import { DeferPasswordChangeCommand } from './commands/defer-password-change.handler';
import { LoginCommand } from './commands/login.handler';
import { LogoutCommand } from './commands/logout.handler';
import { RefreshTokenCommand } from './commands/refresh-token.handler';
import { RegisterManagerCommand } from './commands/register-manager.handler';
import { ResendManagerVerificationCommand } from './commands/resend-manager-verification.handler';
import { VerifyManagerRegistrationCommand } from './commands/verify-manager-registration.handler';
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

  @MessagePattern('auth.register')
  async handleRegister(@Payload() data: { email: string, password: string, clientIp: string }) {
    return this.commandBus.execute(
      new RegisterManagerCommand(data.email, data.password, data.clientIp),
    );
  }

  @MessagePattern('auth.register.verify')
  async handleRegisterVerify(@Payload() data: { token: string }) {
    return this.commandBus.execute(new VerifyManagerRegistrationCommand(data.token));
  }

  @MessagePattern('auth.register.resend')
  async handleRegisterResend(@Payload() data: { email: string, clientIp: string }) {
    return this.commandBus.execute(
      new ResendManagerVerificationCommand(data.email, data.clientIp),
    );
  }

  @MessagePattern('auth.onboarding.organization')
  async handleCreateOnboardingOrganization(
    @Payload() data: {
      id: string
      organizationName: string
      organizationCode: string
      organizationEmail: string
    },
  ) {
    return this.commandBus.execute(
      new CreateOnboardingOrganizationCommand(
        data.id,
        data.organizationName,
        data.organizationCode,
        data.organizationEmail,
      ),
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
      organizationId?: string
    },
  ) {
    return this.queryBus.execute(
      new GetPermissionsQuery(data.id, data.organizationId),
    );
  }

  @EventPattern('auth_event')
  handleAuthEvent(@Payload() data: Record<string, unknown>) {
    this.logger.log('Received external auth event via RMQ. Broadcasting internally...');
    this.eventBus.publish(new AuthNotifiedEvent(data));
  }
}
