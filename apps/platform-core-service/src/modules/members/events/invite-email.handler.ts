import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { InviteEmailEvent } from './invite-email.event';
import { InviteEmailPublisher } from './invite-email.publisher';

@EventsHandler(InviteEmailEvent)
export class InviteEmailHandler implements IEventHandler<InviteEmailEvent> {
  constructor(
    private readonly inviteEmailPublisher: InviteEmailPublisher,
  ) {}

  handle(event: InviteEmailEvent): void {
    this.inviteEmailPublisher.publishInviteEmail(event.payload);
  }
}
