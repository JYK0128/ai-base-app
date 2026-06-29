import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { MemberAccount } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { AppCacheService } from '@/common/services/app-cache.service';
import { ENV } from '@/env';

import { LoginContract } from './login.contract';
import { LoginAsserter } from './login.error';
import type { LoginRequestDto } from './login.request.dto';
import { LoginResponseDto } from './login.response.dto';

type LoginMetadata = {
  attempts?: number
  maxAttempts?: number
  retryAfterSeconds?: number
};

@CommandHandler(LoginContract)
export class LoginHandler implements ICommandHandler<LoginContract> {
  private readonly Asserter = LoginAsserter.onFail(async ({ code, metadata, context }) => {
    if (code === 'INVALID_CREDENTIALS' && context) {
      await this.handleLoginFailure(context, metadata);
    }
  });

  constructor(
    private readonly cls: ClsService,
    private readonly cacheService: AppCacheService,
  ) {}

  @Transactional()
  async execute(command: LoginContract): Promise<LoginResponseDto> {
    const clientIp = this.identifyClientIp();
    const account = await this.identifyAccount(command.data);
    await this.verifyLogin(account, command.data);

    return this.processLogin(account, clientIp);
  }

  private identifyClientIp(): string {
    return this.cls.get('clientIp') ?? '0.0.0.0';
  }

  private async verifyLogin(account: MemberAccount, request: LoginRequestDto): Promise<void> {
    const violationCode = this.getAccountViolationCode(account);
    if (violationCode) {
      await this.Asserter.throw(violationCode);
    }

    const { password } = request;
    const isPasswordValid = account.verifyPassword(password);
    await this.Asserter.assert(isPasswordValid, 'INVALID_CREDENTIALS', {
      context: request,
      metadata: {},
    });
  }

  private async identifyAccount(request: LoginRequestDto) {
    const { email } = request;
    const lockUntil = await this.cacheService.get<number>(this.buildLoginCacheKey('lock', email));
    const retryAfterSeconds = lockUntil
      ? Math.max(1, Math.ceil((lockUntil - Date.now()) / 1000))
      : -2;

    await this.Asserter.throwIf(retryAfterSeconds > 0, 'ACCOUNT_LOCKED', {
      metadata: {
        attempts: ENV.LOGIN_MAX_ATTEMPTS,
        maxAttempts: ENV.LOGIN_MAX_ATTEMPTS,
        retryAfterSeconds,
      },
    });

    const account = await this.Asserter.assert(
      MemberAccount.findOne(
        { email },
        { populate: ['member.organization', 'member.roles.role.permissions.resource'] },
      ),
      'INVALID_CREDENTIALS',
      { context: request },
    );

    return account;
  }

  private async processLogin(account: MemberAccount, clientIp: string): Promise<LoginResponseDto> {
    await Promise.all([
      this.cacheService.del(this.buildLoginCacheKey('attempt', account.email)),
      this.cacheService.del(this.buildLoginCacheKey('lock', account.email)),
    ]);

    account.lastLoginAt = new Date();
    account.lastLoginIp = clientIp;
    this.cls.set('account', {
      email: account.email,
      id: account.id,
      isDormant: account.isDormant,
      isPasswordExpired: account.isPasswordExpired,
      lastLoginAt: account.lastLoginAt,
      passwordExpiresAt: account.passwordExpiresAt,
      status: account.status,
    });
    return new LoginResponseDto();
  }

  private async handleLoginFailure(context: LoginRequestDto, metadata: LoginMetadata = {}) {
    const attemptKey = this.buildLoginCacheKey('attempt', context.email);
    const attempts = await this.cacheService.incr(attemptKey, ENV.LOGIN_ATTEMPT_TTL);

    metadata.attempts = attempts;
    metadata.maxAttempts = ENV.LOGIN_MAX_ATTEMPTS;

    if (attempts >= ENV.LOGIN_MAX_ATTEMPTS) {
      const lockUntil = Date.now() + (ENV.LOGIN_LOCK_TTL * 1000);
      await this.cacheService.set(this.buildLoginCacheKey('lock', context.email), lockUntil, ENV.LOGIN_LOCK_TTL);
      await this.cacheService.del(attemptKey);

      metadata.retryAfterSeconds = ENV.LOGIN_LOCK_TTL;
    }
  }

  private getAccountViolationCode(
    account: MemberAccount,
  ): 'INACTIVE_ACCOUNT' | 'INACTIVE_MEMBER' | 'INACTIVE_ORGANIZATION' | 'DORMANT_ACCOUNT' | undefined {
    if (!account.isActive) {
      return 'INACTIVE_ACCOUNT';
    }

    if (!account.member.isActive) {
      return 'INACTIVE_MEMBER';
    }

    const organization = account.member.organization;
    if (organization && !organization.isActive) {
      return 'INACTIVE_ORGANIZATION';
    }

    if (account.isDormant) {
      return 'DORMANT_ACCOUNT';
    }

    return undefined;
  }

  private buildLoginCacheKey(action: 'attempt' | 'lock', value: string): string {
    return `login:${action}:${value}`;
  }
}
