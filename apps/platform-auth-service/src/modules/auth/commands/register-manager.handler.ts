import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountStatus, ManagerAccountRepository, ManagerAccountVerificationRepository, ManagerAccountVerificationStatus, ManagerRepository, ManagerStatus } from '@pkg/database';

import { CryptoUtil } from '@/common/utils/crypto.util';
import { RedisService } from '@/modules/redis/redis.service';

import { MailerService } from '../services/mailer.service';
import { VerificationTokenService } from '../services/verification-token.service';

export { RegisterManagerCommand } from './register-manager.handler.helpers';
import { RegisterManagerAsserter, RegisterManagerCommand } from './register-manager.handler.helpers';

@CommandHandler(RegisterManagerCommand)
export class RegisterManagerHandler implements ICommandHandler<RegisterManagerCommand> {
  private readonly verificationTtlMs = 24 * 60 * 60 * 1000;
  private readonly rateLimitTtlSeconds = 60;
  private readonly rateLimitMaxRequests = 5;
  private readonly registerKeys = RedisService.for('register');
  private readonly RegisterGuard = RegisterManagerAsserter;

  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly managerRepository: ManagerRepository,
    private readonly verificationRepository: ManagerAccountVerificationRepository,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService,
    private readonly verificationTokenService: VerificationTokenService,
  ) {}

  @Transactional()
  async execute(command: RegisterManagerCommand): Promise<void> {
    await this.assertRateLimit(command.email, command.clientIp);

    await this.RegisterGuard.throwIf(
      !!(await this.managerAccountRepository.findOne({ email: command.email })),
      'EMAIL_ALREADY_EXISTS',
    );

    const manager = this.managerRepository.create({
      status: ManagerStatus.ACTIVE,
      organization: null,
    });

    const account = this.managerAccountRepository.create({
      email: command.email,
      password: await CryptoUtil.hashPassword(command.password),
      status: AccountStatus.PENDING_VERIFICATION,
      manager,
      passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

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
    const key = this.registerKeys.build('attempt', `${clientIp}:${email}`);
    const attempts = await this.redisService.incr(key);
    if (attempts === 1) await this.redisService.expire(key, this.rateLimitTtlSeconds);
    await this.RegisterGuard.throwIf(attempts > this.rateLimitMaxRequests, 'RATE_LIMITED');
  }
}
