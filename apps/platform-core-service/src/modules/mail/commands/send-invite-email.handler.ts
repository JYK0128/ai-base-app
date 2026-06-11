import { EntityManager } from '@mikro-orm/postgresql';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberInvite, type MemberInviteMetadata } from '@pkg/database';

import type { SendInviteEmailPayload } from '../mail.contract';
import { isMailDeliveryQueued, markMailDeliveryFailed, markMailDeliverySent } from '../mail.helper';
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
      await this.handleInviteEmailFailure(context);
    }
  });

  constructor(
    private readonly mailService: MailService,
    private readonly em: EntityManager,
  ) {}

  async execute(command: SendInviteEmailCommand): Promise<void> {
    const invite = await this.identifyInvite(command.payload.inviteId);
    await this.verifyMailDeliveryAttempt(invite, command.payload.attemptId);
    await this.processInviteEmail(command.payload);
    await this.recordMailDeliverySent(command.payload.inviteId, command.payload.attemptId);
  }

  /**
   * STEP 1: 초대 메일 대상 식별
   */
  private async identifyInvite(inviteId: string): Promise<MemberInvite> {
    return await this.Asserter.assert(
      this.em.findOne(MemberInvite, { id: inviteId }),
      'INVITE_NOT_FOUND',
    );
  }

  /**
   * STEP 2: 메일 전송 가능 여부 검증
   */
  private async verifyMailDeliveryAttempt(invite: MemberInvite, attemptId: string): Promise<void> {
    await this.Asserter.throwIf(
      !isMailDeliveryQueued(invite.metadata) || invite.metadata.attemptId !== attemptId,
      'INVITE_MAIL_DELIVERY_NOT_READY',
    );
  }

  /**
   * STEP 3: 메일 전송 처리
   */
  private async processInviteEmail(data: SendInviteEmailPayload): Promise<void> {
    await this.Asserter.assert(
      this.mailService.sendInviteEmail(
        data.email,
        data.organizationName,
        data.inviterName,
        data.token,
      ),
      'MAIL_SEND_FAILED',
      {
        context: {
          inviteId: data.inviteId,
          attemptId: data.attemptId,
          email: data.email,
        },
      },
    );
  }

  /**
   * STEP 4: 메일 전송 실패 처리
   */
  private async handleInviteEmailFailure(
    context: unknown,
  ): Promise<void> {
    const failureContext = this.readSendInviteEmailFailureContext(context);

    if (!failureContext) {
      this.logger.error('Failed to send email with an invalid failure context.');
      return;
    }

    const { inviteId, attemptId, email } = failureContext;

    this.logger.error(`Failed to send email for invite ${inviteId} (${email}) attempt ${attemptId}`);

    await this.recordMailDeliveryFailed(inviteId, attemptId).catch((markError) => {
      this.logger.error(`Failed to record mail delivery failure for invite ${inviteId} attempt ${attemptId}: ${this.describeError(markError)}`);
    });
  }

  private readSendInviteEmailFailureContext(
    value: unknown,
  ): SendInviteEmailFailureContext | undefined {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const maybeValue = value as {
      inviteId?: unknown
      attemptId?: unknown
      email?: unknown
    };

    if (typeof maybeValue.inviteId !== 'string'
      || typeof maybeValue.attemptId !== 'string'
      || typeof maybeValue.email !== 'string') {
      return undefined;
    }

    return {
      inviteId: maybeValue.inviteId,
      attemptId: maybeValue.attemptId,
      email: maybeValue.email,
    };
  }

  private async recordMailDeliverySent(inviteId: string, attemptId: string): Promise<void> {
    await this.recordMailDelivery(
      inviteId,
      attemptId,
      (metadata, nextAttemptId, now) => markMailDeliverySent(metadata, nextAttemptId, now),
      'sent',
    );
  }

  private async recordMailDeliveryFailed(inviteId: string, attemptId: string): Promise<void> {
    await this.recordMailDelivery(
      inviteId,
      attemptId,
      (metadata, nextAttemptId, now) => markMailDeliveryFailed(metadata, nextAttemptId, now),
      'failed',
    );
  }

  private async recordMailDelivery(
    inviteId: string,
    attemptId: string,
    mutate: (metadata: MemberInviteMetadata | undefined, nextAttemptId: string, now: Date) => MemberInviteMetadata,
    recordType: 'sent' | 'failed',
  ): Promise<void> {
    await this.em.transactional(async (em) => {
      const invite = await em.findOne(MemberInvite, { id: inviteId });

      if (!invite) {
        this.logger.warn(`Invite ${inviteId} not found while marking mail delivery ${recordType} for attempt ${attemptId}`);
        return;
      }

      if (!isMailDeliveryQueued(invite.metadata) || invite.metadata.attemptId !== attemptId) {
        this.logger.warn(`Skipping stale mail delivery ${recordType} update for invite ${inviteId} attempt ${attemptId}`);
        return;
      }

      invite.metadata = mutate(invite.metadata, attemptId, new Date());
    });
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown error';
  }
}
