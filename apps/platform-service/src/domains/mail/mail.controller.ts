import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';

import { SendInviteEmailCommand } from './commands';
import { MAIL_EVENT_PATTERNS, type SendInviteEmailPayload } from './mail.contract';

@Controller()
export class MailController {
  private readonly logger = new Logger(MailController.name);

  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @EventPattern(MAIL_EVENT_PATTERNS.INVITE.SEND)
  async handleSendInviteEmail(@Payload() data: SendInviteEmailPayload): Promise<void> {
    await this.commandBus.execute(new SendInviteEmailCommand(data)).catch((error: unknown) => {
      if (this.isExpectedMailEventError(error)) {
        this.logger.warn(`Handled ${MAIL_EVENT_PATTERNS.INVITE.SEND} event for invite ${data.inviteId} with expected error: ${this.describeError(error)}`);
        return;
      }

      throw error;
    });
  }

  private isExpectedMailEventError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const { code } = error as { code?: unknown };

    return (
      code === 'INVITE_NOT_FOUND'
      || code === 'INVITE_MAIL_DELIVERY_NOT_READY'
      || code === 'MAIL_SEND_FAILED'
    );
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const { message } = error as { message?: unknown };

      if (typeof message === 'string') {
        return message;
      }
    }

    return 'Unknown error';
  }
}
