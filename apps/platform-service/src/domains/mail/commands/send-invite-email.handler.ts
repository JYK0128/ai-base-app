import { Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { describeMailError } from '../mail.helper';
import { MailService } from '../mail.service';
import type { SendInviteEmailFailureContext } from '../mail.types';
import { SendInviteEmailCommand } from './send-invite-email.command';
import { SendInviteEmailAsserter } from './send-invite-email.error';

@CommandHandler(SendInviteEmailCommand)
export class SendInviteEmailHandler implements ICommandHandler<SendInviteEmailCommand> {
  private readonly logger = new Logger(SendInviteEmailHandler.name);
  private readonly Asserter = SendInviteEmailAsserter.onFail(async (
    { code, context }: { code: string, context?: SendInviteEmailFailureContext },
  ) => {
    if (code === 'MAIL_SEND_FAILED' && context) {
      this.logger.error(`Failed to send email for invite ${context.inviteId} (${context.email}) attempt ${context.attemptId}`);
    }
  });

  constructor(
    private readonly mailService: MailService,
  ) {}

  async execute(command: SendInviteEmailCommand): Promise<void> {
    const { email, organizationName, inviterName, token } = command.payload;

    await this.Asserter.assert(
      this.mailService.sendInviteEmail(email, organizationName, inviterName, token),
      'MAIL_SEND_FAILED',
      {
        context: {
          inviteId: command.payload.inviteId,
          attemptId: command.payload.attemptId,
          email,
        },
      },
    ).catch((error: unknown) => {
      this.logger.error(`Invitation email send failed: ${describeMailError(error)}`);
      throw error;
    });
  }
}
