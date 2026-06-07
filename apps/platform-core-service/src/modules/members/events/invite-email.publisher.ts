import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { MAIL_EVENT_PATTERNS, type SendInviteEmailPayload } from '../../mail/mail.contract';
import { INVITE_EMAIL_QUEUE } from '../members.constants';

@Injectable()
export class InviteEmailPublisher {
  private readonly logger = new Logger(InviteEmailPublisher.name);

  constructor(
    @Inject(INVITE_EMAIL_QUEUE) private readonly client: ClientProxy,
  ) {}

  publishInviteEmail(payload: SendInviteEmailPayload): void {
    const inviteSendPattern = MAIL_EVENT_PATTERNS.INVITE.SEND;
    this.logger.log(`Publishing ${inviteSendPattern} event to RabbitMQ for invite ${payload.inviteId} (${payload.email}) attempt ${payload.attemptId}`);
    this.client.emit(inviteSendPattern, payload).subscribe({
      error: (error) => {
        this.logger.error(`Failed to publish ${inviteSendPattern} event for invite ${payload.inviteId} attempt ${payload.attemptId}: ${error instanceof Error ? error.message : String(error)}`);
      },
    });
  }
}
