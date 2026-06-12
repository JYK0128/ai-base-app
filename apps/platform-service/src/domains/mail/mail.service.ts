import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

import { ENV } from '@/env';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor() {
    this.transporter = createTransport({
      host: ENV.MAIL_HOST,
      port: ENV.MAIL_PORT,
      secure: ENV.MAIL_SECURE,
      auth: {
        user: ENV.MAIL_USER,
        pass: ENV.MAIL_PASS,
      },
    });
    this.fromAddress = ENV.MAIL_USER;
    this.logger.log(`SMTP transport initialized successfully for ${ENV.MAIL_HOST}:${ENV.MAIL_PORT}.`);
  }

  async sendInviteEmail(
    to: string,
    organizationName: string,
    inviterName: string,
    token: string,
  ): Promise<void> {
    const acceptLink = `${ENV.CLIENT_URL}/invite/accept?token=${token}`;
    const subject = `[${organizationName}] 초대장 - 가입을 완료해 주세요`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">멤버 초대 안내</h2>
        <p>안녕하세요,</p>
        <p><strong>${organizationName}</strong>의 <strong>${inviterName}</strong>님께서 귀하를 멤버로 초대하셨습니다.</p>
        <p>아래 링크를 클릭하여 초대를 수락하고 회원가입을 완료해 주세요.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${acceptLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">초대 수락하기</a>
        </div>
        <p style="color: #666; font-size: 14px;">본 링크는 7일간 유효합니다. 만약 본인이 요청하지 않은 경우, 이 메일을 무시하셔도 됩니다.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">본 메일은 발신전용 메일입니다.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"AI Base App" <${this.fromAddress}>`,
      to,
      subject,
      html,
    });
    this.logger.log(`Invitation email sent successfully to ${to}`);
  }
}
