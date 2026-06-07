import type { SendInviteEmailPayload } from '../../mail/mail.contract';

export class InviteEmailEvent {
  constructor(
    public readonly payload: SendInviteEmailPayload,
  ) {}
}
