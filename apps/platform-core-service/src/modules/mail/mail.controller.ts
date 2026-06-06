import { EntityManager } from '@mikro-orm/postgresql';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MemberInvite } from '@pkg/database';

import { MailService } from './mail.service';
import { markMailDeliveryFailed, markMailDeliverySent } from './mail-delivery';

export interface SendInviteEmailDto {
  inviteId: string
  attemptId: string
  email: string
  organizationName: string
  inviterName: string
  token: string
}

@Controller()
export class MailController {
  private readonly logger = new Logger(MailController.name);

  constructor(
    private readonly mailService: MailService,
    private readonly em: EntityManager,
  ) {}

  @EventPattern('send_invite_email')
  async handleSendInviteEmail(@Payload() data: SendInviteEmailDto): Promise<void> {
    this.logger.log(`Received send_invite_email event for invite ${data.inviteId} (${data.email}) attempt ${data.attemptId}`);

    const invite = await this.em.findOne(MemberInvite, { id: data.inviteId });

    if (!invite) {
      this.logger.warn(`Invite ${data.inviteId} not found for send_invite_email attempt ${data.attemptId}`);
      return;
    }

    if (!invite.isMailDeliveryQueued || invite.metadata.mailDelivery?.attemptId !== data.attemptId) {
      this.logger.warn(`Skipping stale send_invite_email event for invite ${data.inviteId} attempt ${data.attemptId}`);
      return;
    }

    try {
      await this.mailService.sendInviteEmail(
        data.email,
        data.organizationName,
        data.inviterName,
        data.token,
      );
    }
    catch (error) {
      this.logger.error(`Failed to send email for invite ${data.inviteId} attempt ${data.attemptId}: ${this.describeError(error)}`);

      try {
        await this.recordMailDeliveryFailed(data.inviteId, data.attemptId);
      }
      catch (markError) {
        this.logger.error(`Failed to record mail delivery failure for invite ${data.inviteId} attempt ${data.attemptId}: ${this.describeError(markError)}`);
      }

      return;
    }

    try {
      await this.recordMailDeliverySent(data.inviteId, data.attemptId);
    }
    catch (error) {
      this.logger.error(`Failed to record mail delivery success for invite ${data.inviteId} attempt ${data.attemptId}: ${this.describeError(error)}`);
    }
  }

  private async recordMailDeliverySent(inviteId: string, attemptId: string): Promise<void> {
    await this.em.transactional(async (em) => {
      const invite = await em.findOne(MemberInvite, { id: inviteId });

      if (!invite) {
        this.logger.warn(`Invite ${inviteId} not found while marking mail delivery sent for attempt ${attemptId}`);
        return;
      }

      if (!invite.isMailDeliveryQueued || invite.metadata.mailDelivery?.attemptId !== attemptId) {
        this.logger.warn(`Skipping stale mail delivery success update for invite ${inviteId} attempt ${attemptId}`);
        return;
      }

      invite.metadata = markMailDeliverySent(invite.metadata, attemptId, new Date());
    });
  }

  private async recordMailDeliveryFailed(inviteId: string, attemptId: string): Promise<void> {
    await this.em.transactional(async (em) => {
      const invite = await em.findOne(MemberInvite, { id: inviteId });

      if (!invite) {
        this.logger.warn(`Invite ${inviteId} not found while marking mail delivery failed for attempt ${attemptId}`);
        return;
      }

      if (!invite.isMailDeliveryQueued || invite.metadata.mailDelivery?.attemptId !== attemptId) {
        this.logger.warn(`Skipping stale mail delivery failure update for invite ${inviteId} attempt ${attemptId}`);
        return;
      }

      invite.metadata = markMailDeliveryFailed(invite.metadata, attemptId, new Date());
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
