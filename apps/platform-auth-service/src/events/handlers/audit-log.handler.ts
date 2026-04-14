import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { AuditLogEvent } from '../impl/audit-log.event';

@EventsHandler(AuditLogEvent)
export class AuditLogHandler implements IEventHandler<AuditLogEvent> {
  private readonly logger = new Logger(AuditLogHandler.name);

  handle(event: AuditLogEvent) {
    const { action, metadata, timestamp } = event;
    this.logger.log(`[AUDIT] ${action} at ${timestamp.toISOString()}: ${JSON.stringify(metadata)}`);

    // 여기서 DB에 로그를 저장하거나 외부 로깅 시스템으로 전송합니다.
  }
}
