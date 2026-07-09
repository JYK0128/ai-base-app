import { Command } from '@nestjs/cqrs';

import type { InviteEmailPayload } from '../mail.contract';

export class InviteEmailContract extends Command<void> {
  constructor(
    public readonly payload: InviteEmailPayload,
  ) {
    super();
  }
}
