import { Transactional } from '@mikro-orm/decorators/legacy';
import { Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { MailService } from '../mail.service';
import type { SendInviteEmailFailureContext } from '../mail.types';
import { SendInviteEmailContract } from './send-invite-email.contract';
import { SendInviteEmailAsserter } from './send-invite-email.error';

@CommandHandler(SendInviteEmailContract)
export class SendInviteEmailHandler implements ICommandHandler<SendInviteEmailContract> {
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

  @Transactional()
  async execute(command: SendInviteEmailContract): Promise<void> {
    const payload = await this.identifyPayload(command);
    await this.verifyPolicies(payload);
    await this.processSend(payload);
  }

  private async identifyPayload(command: SendInviteEmailContract): Promise<SendInviteEmailContract['payload']> {
    return command.payload;
  }

  private async verifyPolicies(_payload: SendInviteEmailContract['payload']): Promise<void> {
    // 발송 정책 유효성 검사 영역
  }

  private async processSend(payload: SendInviteEmailContract['payload']): Promise<void> {
    const { email, organizationName, inviterName, token, inviteId, attemptId } = payload;

    await this.Asserter.assert(
      this.mailService.sendInviteEmail(email, organizationName, inviterName, token),
      'MAIL_SEND_FAILED',
      {
        context: {
          inviteId,
          attemptId,
          email,
        },
      },
    ).catch((error: unknown) => {
      this.logger.error(`Invitation email send failed: ${this.describeMailError(error)}`);
      throw error;
    });
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
