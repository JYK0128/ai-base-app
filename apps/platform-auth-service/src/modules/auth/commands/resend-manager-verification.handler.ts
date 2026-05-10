import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountStatus, ManagerAccountRepository, ManagerAccountVerificationRepository, ManagerAccountVerificationStatus } from '@pkg/database';

import { RedisService } from '@/modules/redis/redis.service';

import { MailerService } from '../services/mailer.service';
import { VerificationTokenService } from '../services/verification-token.service';

export { ResendManagerVerificationCommand } from './resend-manager-verification.handler.helpers';
import { ResendManagerVerificationAsserter, ResendManagerVerificationCommand } from './resend-manager-verification.handler.helpers';

@CommandHandler(ResendManagerVerificationCommand)
export class ResendManagerVerificationHandler implements ICommandHandler<ResendManagerVerificationCommand> {
  private readonly verificationTtlMs = 24 * 60 * 60 * 1000;
  private readonly rateLimitTtlSeconds = 60;
  private readonly rateLimitMaxRequests = 5;
  private readonly resendKeys = RedisService.for('register-resend');
  private readonly ResendGuard = ResendManagerVerificationAsserter;

  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly verificationRepository: ManagerAccountVerificationRepository,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService,
    private readonly verificationTokenService: VerificationTokenService,
  ) {}

  @Transactional()
  async execute(command: ResendManagerVerificationCommand): Promise<void> {
    await this.assertRateLimit(command.email, command.clientIp);

    const account = await this.managerAccountRepository.findOne({
      email: command.email,
      status: AccountStatus.PENDING_VERIFICATION,
    });

    if (!account) return;

    const existing = await this.verificationRepository.find({
      managerAccount: account.id,
      status: ManagerAccountVerificationStatus.PENDING,
    });

    for (const verification of existing) {
      verification.status = ManagerAccountVerificationStatus.CANCELED;
    }

    const token = this.verificationTokenService.createToken();
    this.verificationRepository.create({
      managerAccount: account,
      tokenHash: this.verificationTokenService.hashToken(token),
      expiresAt: new Date(Date.now() + this.verificationTtlMs),
      status: ManagerAccountVerificationStatus.PENDING,
    });

    await this.mailerService.sendManagerVerification(account.email, token);
  }

  private async assertRateLimit(email: string, clientIp: string) {
    const key = this.resendKeys.build('attempt', `${clientIp}:${email}`);
    const attempts = await this.redisService.incr(key);
    if (attempts === 1) await this.redisService.expire(key, this.rateLimitTtlSeconds);
    await this.ResendGuard.throwIf(attempts > this.rateLimitMaxRequests, 'RATE_LIMITED');
  }
}
