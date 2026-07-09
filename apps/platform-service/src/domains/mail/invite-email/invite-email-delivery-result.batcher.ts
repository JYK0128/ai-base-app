import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

import type { InviteEmailDeliveryResultPayload } from '../mail.contract';

interface QueuedDeliveryResult {
  readonly payload: InviteEmailDeliveryResultPayload
  readonly context: RmqContext
}

interface AcknowledgeableChannel {
  ack(message: unknown): void
  nack(message: unknown, allUpTo?: boolean, requeue?: boolean): void
}

@Injectable()
export class InviteEmailDeliveryResultBatcher implements OnModuleDestroy {
  private readonly logger = new Logger(InviteEmailDeliveryResultBatcher.name);
  private readonly maxBatchSize = 100;
  private readonly flushIntervalMs = 1000;
  private readonly items: QueuedDeliveryResult[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private flushing = false;

  constructor(
    private readonly em: EntityManager,
  ) {}

  enqueue(payload: InviteEmailDeliveryResultPayload, context: RmqContext): void {
    this.items.push({ payload, context });

    if (this.items.length >= this.maxBatchSize) {
      void this.flush();
      return;
    }

    this.scheduleFlush();
  }

  async onModuleDestroy(): Promise<void> {
    await this.flush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setTimeout(() => {
      void this.flush();
    }, this.flushIntervalMs);
  }

  private async flush(): Promise<void> {
    if (this.flushing || this.items.length === 0) {
      return;
    }

    this.clearFlushTimer();
    this.flushing = true;

    const batch = this.items.splice(0, this.maxBatchSize);

    try {
      await this.bulkUpdate(batch.map((item) => item.payload));
      this.ack(batch);
      this.logger.log(`Bulk updated ${batch.length} invite delivery result messages.`);
    }
    catch (error) {
      this.nack(batch);
      this.logger.error(`Failed to bulk update invite delivery result messages: ${error instanceof Error ? error.message : String(error)}`);
    }
    finally {
      this.flushing = false;

      if (this.items.length > 0) {
        this.scheduleFlush();
      }
    }
  }

  private async bulkUpdate(payloads: InviteEmailDeliveryResultPayload[]): Promise<void> {
    const sentPayloads = payloads.filter((payload) => payload.status === 'SENT');
    const failedPayloads = payloads.filter((payload) => payload.status === 'FAILED');

    await this.bulkUpdateSent(sentPayloads);
    await this.bulkUpdateFailed(failedPayloads);
  }

  private async bulkUpdateSent(payloads: InviteEmailDeliveryResultPayload[]): Promise<void> {
    if (payloads.length === 0) {
      return;
    }

    const params = payloads.flatMap((payload) => [
      payload.inviteId,
      payload.occurredAt,
    ]);
    const values = payloads.map(() => '(?, ?)').join(', ');

    await this.em.getConnection().execute(
      `
        UPDATE "platform"."MemberInvite" AS invite
        SET
          "metadata" = jsonb_set(
            jsonb_set(COALESCE(invite."metadata", '{}'::jsonb), '{sentAt}', to_jsonb(result."occurredAt"::text), true),
            '{failedAt}',
            'null'::jsonb,
            true
          ),
          "updatedAt" = NOW()
        FROM (VALUES ${values}) AS result("id", "occurredAt")
        WHERE invite."id" = result."id"
          AND invite."deletedAt" IS NULL
          AND invite."metadata"->>'cancelAt' IS NULL
          AND invite."metadata"->>'acceptedAt' IS NULL
          AND invite."metadata"->>'rejectedAt' IS NULL
      `,
      params,
    );
  }

  private async bulkUpdateFailed(payloads: InviteEmailDeliveryResultPayload[]): Promise<void> {
    if (payloads.length === 0) {
      return;
    }

    const params = payloads.flatMap((payload) => [
      payload.inviteId,
      payload.occurredAt,
    ]);
    const values = payloads.map(() => '(?, ?)').join(', ');

    await this.em.getConnection().execute(
      `
        UPDATE "platform"."MemberInvite" AS invite
        SET
          "metadata" = jsonb_set(COALESCE(invite."metadata", '{}'::jsonb), '{failedAt}', to_jsonb(result."occurredAt"::text), true),
          "updatedAt" = NOW()
        FROM (VALUES ${values}) AS result("id", "occurredAt")
        WHERE invite."id" = result."id"
          AND invite."deletedAt" IS NULL
          AND invite."metadata"->>'cancelAt' IS NULL
          AND invite."metadata"->>'acceptedAt' IS NULL
          AND invite."metadata"->>'rejectedAt' IS NULL
      `,
      params,
    );
  }

  private ack(batch: QueuedDeliveryResult[]): void {
    for (const item of batch) {
      const channel = item.context.getChannelRef() as AcknowledgeableChannel;
      channel.ack(item.context.getMessage());
    }
  }

  private nack(batch: QueuedDeliveryResult[]): void {
    for (const item of batch) {
      const channel = item.context.getChannelRef() as AcknowledgeableChannel;
      channel.nack(item.context.getMessage(), false, true);
    }
  }

  private clearFlushTimer(): void {
    if (!this.flushTimer) {
      return;
    }

    clearTimeout(this.flushTimer);
    this.flushTimer = null;
  }
}
