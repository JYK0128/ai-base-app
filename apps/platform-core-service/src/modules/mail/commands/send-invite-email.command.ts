import type { SendInviteEmailPayload } from '../mail.contract';

/**
 * 초대 메일 전송 커맨드
 */
export class SendInviteEmailCommand {
  constructor(
    public readonly payload: SendInviteEmailPayload,
  ) {}
}
