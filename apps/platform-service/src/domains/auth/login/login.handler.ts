import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { JwtUtil } from '@pkg/shared';

import { ENV } from '@/env';

import { AuthCacheService } from '../auth.cache';
import { extractPermissions } from '../auth.helper';
import { LoginContract } from './login.contract';
import { LoginAsserter } from './login.error';
import type { LoginRequestDto } from './login.request.dto';
import type { LoginResponseDto } from './login.response.dto';

type LoginMetadata = {
  attempts?: number
  maxAttempts?: number
  retryAfterSeconds?: number
  accessToken?: string
};

@CommandHandler(LoginContract)
export class LoginHandler implements ICommandHandler<LoginContract> {
  private readonly loginKeys = AuthCacheService.for('login');
  private readonly Asserter = LoginAsserter.onFail(async ({ code, metadata, context }) => {
    if (code === 'INVALID_CREDENTIALS' && context) {
      await this.handleLoginFailure(context, metadata);
    }
  });

  constructor(
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
    private readonly authService: AuthCacheService,
  ) {}

  @Transactional()
  async execute(command: LoginContract): Promise<LoginResponseDto> {
    const { email, password, clientIp } = command.data;
    const account = await this.identifyAccount(email);
    await this.validatePolicies(account);
    await this.verifyCredentials(account, password);

    return this.processLoginSuccess(account, clientIp);
  }

  private async identifyAccount(email: string) {
    const lockUntil = await this.authService.get<number>(this.loginKeys.build('lock', email));
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
        { populate: ['member.organization', 'member.organizationRoles.role.permissions.resource'] },
      ),
      'INVALID_CREDENTIALS',
      { context: { email } },
    );

    return account;
  }

  private async validatePolicies(account: MemberAccount) {
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
    await this.Asserter.throwIf(!account.member.isActive, 'INACTIVE_MEMBER');

    const organization = account.member.organization;
    if (organization) {
      await this.Asserter.throwIf(!organization.isActive, 'INACTIVE_ORGANIZATION');
    }

    await this.Asserter.throwIf(account.isDormant, 'DORMANT_ACCOUNT');
  }

  private async verifyCredentials(account: MemberAccount, password: string) {
    const isPasswordValid = account.verifyPassword(password);
    await this.Asserter.assert(isPasswordValid, 'INVALID_CREDENTIALS', {
      context: { email: account.email },
      metadata: {},
    });
  }

  private async processLoginSuccess(account: MemberAccount, clientIp: string) {
    await Promise.all([
      this.authService.del(this.loginKeys.build('attempt', account.email)),
      this.authService.del(this.loginKeys.build('lock', account.email)),
    ]);

    account.lastLoginAt = new Date();
    account.lastLoginIp = clientIp;

    const isPasswordExpired = account.isPasswordExpired;
    const organizationId = account.member.organization?.id;
    const memberId = account.member.id;
    const accessExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_ACCESS_EXPIRES_IN;
    const refreshExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_REFRESH_EXPIRES_IN;
    const { permissions } = extractPermissions(account.member, organizationId);
    const accountId = account.id;

    const tokens = await JwtUtil.issuePair(
      {
        sub: accountId,
        accountId,
        memberId,
        organizationId,
        mustChangePassword: isPasswordExpired,
        permissions,
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

    await this.authService.set(
      `refresh:${account.id}`,
      tokens.refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return tokens;
  }

  private async handleLoginFailure(context: Pick<LoginRequestDto, 'email'>, metadata: LoginMetadata = {}) {
    const attemptKey = this.loginKeys.build('attempt', context.email);
    const attempts = await this.authService.incr(attemptKey, ENV.LOGIN_ATTEMPT_TTL);

    metadata.attempts = attempts;
    metadata.maxAttempts = ENV.LOGIN_MAX_ATTEMPTS;

    if (attempts >= ENV.LOGIN_MAX_ATTEMPTS) {
      const lockUntil = Date.now() + (ENV.LOGIN_LOCK_TTL * 1000);
      await this.authService.set(this.loginKeys.build('lock', context.email), lockUntil, ENV.LOGIN_LOCK_TTL);
      await this.authService.del(attemptKey);

      metadata.retryAfterSeconds = ENV.LOGIN_LOCK_TTL;
    }
  }
}
