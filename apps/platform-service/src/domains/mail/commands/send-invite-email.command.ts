import type { SendInviteEmailPayload } from '../mail.contract';

export class SendInviteEmailCommand {
  constructor(
    public readonly payload: SendInviteEmailPayload,
  ) {}
}
