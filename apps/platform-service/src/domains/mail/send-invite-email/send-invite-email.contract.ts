import { Command } from '@nestjs/cqrs';

import type { SendInviteEmailPayload } from '../mail.contract';

export class SendInviteEmailContract extends Command<void> {
  constructor(
    public readonly payload: SendInviteEmailPayload,
  ) {
    super();
  }
}
