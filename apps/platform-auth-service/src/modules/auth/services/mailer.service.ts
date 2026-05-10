import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  async sendManagerVerification(email: string, token: string): Promise<void> {
    this.logger.log(`Manager verification email for ${email}: token=${token}`);
  }
}
