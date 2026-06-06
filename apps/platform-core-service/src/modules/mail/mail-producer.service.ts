import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface SendInviteEmailPayload {
  inviteId: string
  attemptId: string
  email: string
  organizationName: string
  inviterName: string
  token: string
}

@Injectable()
export class MailProducerService {
  private readonly logger = new Logger(MailProducerService.name);

  constructor(
    @Inject('MAIL_QUEUE') private readonly client: ClientProxy,
  ) {}

  async sendInviteEmail(payload: SendInviteEmailPayload): Promise<void> {
    this.logger.log(`Publishing send_invite_email event to RabbitMQ for invite ${payload.inviteId} (${payload.email}) attempt ${payload.attemptId}`);
    this.client.emit('send_invite_email', payload);
  }
}
