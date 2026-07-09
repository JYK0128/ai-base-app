import { Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { MailService } from '../mail.service';
import type { InviteEmailFailureContext } from '../mail.types';
import { InviteEmailContract } from './invite-email.contract';
import { InviteEmailAsserter } from './invite-email.error';
import { InviteEmailDeliveryResultPublisher } from './invite-email-delivery-result.publisher';

@CommandHandler(InviteEmailContract)
export class SendInviteEmailHandler implements ICommandHandler<InviteEmailContract> {
  private readonly logger = new Logger(SendInviteEmailHandler.name);
  private readonly Asserter = InviteEmailAsserter.onFail(async (
    { code, context }: { code: string, context?: InviteEmailFailureContext },
  ) => {
    if (code === 'MAIL_SEND_FAILED' && context) {
      this.logger.error(`Failed to send email for invite ${context.inviteId} (${context.email})`);
    }
  });

  constructor(
    private readonly mailService: MailService,
    private readonly deliveryResultPublisher: InviteEmailDeliveryResultPublisher,
  ) {}

  async execute(command: InviteEmailContract): Promise<void> {
    const payload = await this.identifyPayload(command);
    await this.verifyPolicies(payload);
    await this.processSend(payload);
  }

  private async identifyPayload(command: InviteEmailContract): Promise<InviteEmailContract['payload']> {
    return command.payload;
  }

  private async verifyPolicies(_payload: InviteEmailContract['payload']): Promise<void> {
    // 발송 정책 유효성 검사 영역
  }

  private async processSend(payload: InviteEmailContract['payload']): Promise<void> {
    const { email, organizationName, inviterName, token, inviteId } = payload;

    try {
      await this.Asserter.assert(
        this.mailService.sendInviteEmail(email, organizationName, inviterName, token),
        'MAIL_SEND_FAILED',
        {
          context: {
            inviteId,
            email,
          },
        },
      );
      this.deliveryResultPublisher.publishDeliveryResult({
        inviteId,
        status: 'SENT',
        occurredAt: new Date().toISOString(),
      });
    }
    catch (error: unknown) {
      this.logger.error(`Invitation email send failed: ${this.describeMailError(error)}`);
      this.deliveryResultPublisher.publishDeliveryResult({
        inviteId,
        status: 'FAILED',
        occurredAt: new Date().toISOString(),
        errorMessage: this.describeMailError(error),
      });
      throw error;
    }
  }

  private describeMailError(error: unknown): string {
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
