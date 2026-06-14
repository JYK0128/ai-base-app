import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { JwtUtil } from '@pkg/shared';

import { ENV } from '@/env';

import { AuthCacheService } from '../auth.cache';
import { AuthLoginContract } from './login.contract';
import { LoginAsserter } from './login.error';
import type { AuthLoginRequestDto } from './login.request.dto';
import type { AuthLoginResponseDto } from './login.response.dto';

type LoginMetadata = {
  attempts?: number
  maxAttempts?: number
  retryAfterSeconds?: number
  accessToken?: string
};

@CommandHandler(AuthLoginContract)
export class LoginHandler implements ICommandHandler<AuthLoginContract> {
  private readonly loginKeys = AuthCacheService.for('login');
  private readonly Asserter = LoginAsserter.onFail(async ({ code, metadata, context }) => {
    if (code === 'INVALID_CREDENTIALS' && context) {
      await this.handleLoginFailure(context, metadata);
    }
  });

  constructor(
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
    private readonly authCacheService: AuthCacheService,
  ) {}

  @Transactional()
  async execute(command: AuthLoginContract): Promise<AuthLoginResponseDto> {
    const { email, password, clientIp } = command.data;
    const account = await this.identifyAccount(email);
    await this.validatePolicies(account, password);

    return this.processLoginSuccess(account, clientIp ?? '0.0.0.0');
  }

  private async identifyAccount(email: string) {
    const lockUntil = await this.authCacheService.get<number>(this.loginKeys.build('lock', email));
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
      this.memberAccountRepository.findOne(
        { email },
        { populate: ['member.organization', 'member.roles.role.permissions.resource'] },
      ),
      'INVALID_CREDENTIALS',
      { context: { email } },
    );

    return account;
  }

  private async validatePolicies(account: MemberAccount, password: string) {
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
    await this.Asserter.throwIf(!account.member.isActive, 'INACTIVE_MEMBER');

    const organization = account.member.organization;
    if (organization) {
      await this.Asserter.throwIf(!organization.isActive, 'INACTIVE_ORGANIZATION');
    }

    await this.Asserter.throwIf(account.isDormant, 'DORMANT_ACCOUNT');

    const isPasswordValid = account.verifyPassword(password);
    await this.Asserter.assert(isPasswordValid, 'INVALID_CREDENTIALS', {
      context: { email: account.email },
      metadata: {},
    });
  }

  private async processLoginSuccess(account: MemberAccount, clientIp: string) {
    await Promise.all([
      this.authCacheService.del(this.loginKeys.build('attempt', account.email)),
      this.authCacheService.del(this.loginKeys.build('lock', account.email)),
    ]);

    account.lastLoginAt = new Date();
    account.lastLoginIp = clientIp;

    const accessExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_ACCESS_EXPIRES_IN;
    const refreshExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_REFRESH_EXPIRES_IN;

    const tokens = await JwtUtil.issuePair(
      {
        sub: account.id,
      },
      {
        access: {
          secret: ENV.JWT_ACCESS_SECRET,
          expires: accessExpiresAt,
        },
        refresh: {
          secret: ENV.JWT_REFRESH_SECRET,
          expires: refreshExpiresAt,
        },
      },
    );

    await this.authCacheService.set(
      `refresh:${account.id}`,
      tokens.refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return tokens;
  }

  private async handleLoginFailure(context: Pick<AuthLoginRequestDto, 'email'>, metadata: LoginMetadata = {}) {
    const attemptKey = this.loginKeys.build('attempt', context.email);
    const attempts = await this.authCacheService.incr(attemptKey, ENV.LOGIN_ATTEMPT_TTL);

    metadata.attempts = attempts;
    metadata.maxAttempts = ENV.LOGIN_MAX_ATTEMPTS;

    if (attempts >= ENV.LOGIN_MAX_ATTEMPTS) {
      const lockUntil = Date.now() + (ENV.LOGIN_LOCK_TTL * 1000);
      await this.authCacheService.set(this.loginKeys.build('lock', context.email), lockUntil, ENV.LOGIN_LOCK_TTL);
      await this.authCacheService.del(attemptKey);

      metadata.retryAfterSeconds = ENV.LOGIN_LOCK_TTL;
    }
  }
}
