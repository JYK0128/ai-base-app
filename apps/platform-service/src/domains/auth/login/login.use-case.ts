import { Transactional } from '@mikro-orm/decorators/legacy';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { JwtUtil } from '@pkg/shared';

import { ENV } from '@/env';

import { AuthService, extractPermissions } from '../auth.service';
import type { LoginContext, LoginInput, LoginMetadata } from '../auth.types';
import { LoginAsserter } from '../auth.errors';

/**
 * 로그인 처리 유스케이스
 */
export class LoginUseCase {
  private readonly loginKeys = AuthService.for('login');
  private readonly Asserter = LoginAsserter.onFail(async ({ code, metadata, context }) => {
    if (code === 'INVALID_CREDENTIALS' && context) {
      await this.handleLoginFailure(context, metadata);
    }
  });

  constructor(
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
    private readonly authService: AuthService,
  ) {}

  @Transactional()
  async execute({ email, password, clientIp }: LoginInput) {
    const account = await this.identifyAccount(email);
    await this.validatePolicies(account);
    await this.verifyCredentials(account, password);

    return this.processLoginSuccess(account, clientIp);
  }

  /**
   * STEP 1: 식별 및 계정 확보
   */
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

  /**
   * STEP 2: 정책 검증
   */
  private async validatePolicies(account: MemberAccount) {
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
    await this.Asserter.throwIf(!account.member.isActive, 'INACTIVE_MEMBER');

    const organization = account.member.organization;
    if (organization) {
      await this.Asserter.throwIf(!organization.isActive, 'INACTIVE_ORGANIZATION');
    }

    // 휴면 계정 확인
    await this.Asserter.throwIf(account.isDormant, 'DORMANT_ACCOUNT');
  }

  /**
   * STEP 3: 자격 증명 확인
   */
  private async verifyCredentials(account: MemberAccount, password: string) {
    const isPasswordValid = account.verifyPassword(password);
    await this.Asserter.assert(isPasswordValid, 'INVALID_CREDENTIALS', {
      context: { email: account.email },
      metadata: {},
    });
  }

  /**
   * STEP 4: 성공 처리 및 응답
   */
  private async processLoginSuccess(account: MemberAccount, clientIp: string) {
    // 실패 이력 초기화
    await Promise.all([
      this.authService.del(this.loginKeys.build('attempt', account.email)),
      this.authService.del(this.loginKeys.build('lock', account.email)),
    ]);

    // 접속 정보 업데이트
    account.lastLoginAt = new Date();
    account.lastLoginIp = clientIp;

    // 비밀번호 만료 확인
    const isPasswordExpired = account.isPasswordExpired;

    const organizationId = account.member.organization?.id;
    const memberId = account.member.id;
    const accessExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_ACCESS_EXPIRES_IN;
    const refreshExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_REFRESH_EXPIRES_IN;

    // 권한 정보 조회
    const { permissions } = extractPermissions(account.member, organizationId);
    const accountId = account.id;

    // 토큰 생성
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

  /**
   * STEP 5: 실패 처리 부수 효과
   */
  private async handleLoginFailure(context: LoginContext, metadata: LoginMetadata = {}) {
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
