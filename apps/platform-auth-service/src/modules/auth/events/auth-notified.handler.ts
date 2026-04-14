import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

export class AuthNotifiedEvent {
  constructor(public readonly data: Record<string, unknown>) {}
}

@EventsHandler(AuthNotifiedEvent)
export class AuthNotifiedHandler implements IEventHandler<AuthNotifiedEvent> {
  private readonly logger = new Logger(AuthNotifiedHandler.name);

  handle(event: AuthNotifiedEvent) {
    const { data } = event;
    this.logger.log('--- Internal Event Received ---');
    this.logger.log(`Processing notified data: ${JSON.stringify(data)}`);
    this.logger.log('Internal processing completed successfully.');
  }
}
