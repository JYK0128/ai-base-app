import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { type InviteEmailDeliveryResultPayload, MAIL_EVENT_PATTERNS } from '../mail.contract';

@Injectable()
export class InviteEmailDeliveryResultPublisher {
  private readonly logger = new Logger(InviteEmailDeliveryResultPublisher.name);

  constructor(
    @Inject('RABBITMQ_DELIVERY_RESULT_CLIENT') private readonly client: ClientProxy,
  ) {}

  publishDeliveryResult(payload: InviteEmailDeliveryResultPayload): void {
    const pattern = MAIL_EVENT_PATTERNS.INVITE.DELIVERY_RESULT;

    this.logger.log(`Publishing ${pattern} event for invite ${payload.inviteId} status ${payload.status}`);
    this.client.emit(pattern, payload).subscribe({
      error: (error) => {
        this.logger.error(`Failed to publish ${pattern} event for invite ${payload.inviteId}: ${error instanceof Error ? error.message : String(error)}`);
      },
    });
  }
}
