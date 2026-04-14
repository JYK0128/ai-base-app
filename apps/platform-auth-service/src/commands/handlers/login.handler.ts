import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { AuditLogEvent } from '../../events/impl/audit-log.event';
import { LoginCommand } from '../impl/login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(private readonly eventBus: EventBus) {}

  async execute(command: LoginCommand) {
    const { userId, clientIp } = command;
    this.logger.log(`Executing LoginCommand for user: ${userId}`);

    // Business Logic (e.g., updating last login time)
    // ...

    // Publish Event for logging/auditing
    this.eventBus.publish(
      new AuditLogEvent('LOGIN_ATTEMPT', { userId, clientIp, status: 'success' }),
    );

    return { success: true, userId };
  }
}
