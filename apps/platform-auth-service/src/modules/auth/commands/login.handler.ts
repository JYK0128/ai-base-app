import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, ManagerAccount, ManagerAccountRepository, ManagerStatus, OrganizationStatus } from '@pkg/database';

import { ENV } from '@/common/env';
import { CryptoUtil } from '@/common/utils/crypto.util';
import { TokenUtil } from '@/common/utils/token.util';
import { RedisService } from '@/modules/redis/redis.service';

export { LoginCommand } from './login.handler.helpers';
import { LoginAsserter, LoginCommand } from './login.handler.helpers';

/**
 * 로그인 처리 핸들러
 */
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly loginKeys = RedisService.for('login');
  private readonly LoginGuard = LoginAsserter.onFail(({ code, context }) => {
    if (code === 'INVALID_CREDENTIALS' && context) {
      return this.handleLoginFailure(context.email);
    }
  });

  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  @Transactional()
  async execute({
    email,
    password,
    clientIp,
  }: LoginCommand): Promise<{ accessToken: string, refreshToken: string, mustCreateOrganization: boolean }> {
    const account = await this.identifyAccount(email);
    await this.validatePolicies(account);
    await this.verifyCredentials(account, password);

    return this.processLoginSuccess(account, clientIp);
  }

  // --- 1. 식별 및 계정 확보 ---

  private async identifyAccount(email: string) {
    const lockTtl = await this.redisService.ttl(this.loginKeys.build('lock', email));
    await this.LoginGuard.throwIf(lockTtl > 0, 'ACCOUNT_LOCKED', {
      metadata: {
        remainingAttempts: 0,
        retryAfterSeconds: lockTtl,
        lockedUntil: new Date(Date.now() + lockTtl * 1000).toISOString(),
      },
    });

    return await this.LoginGuard.assert(
      await this.managerAccountRepository.findOne(
        { email },
        { populate: ['manager.organization'] },
      ),
      'INVALID_CREDENTIALS',
      { context: { email } },
    );
  }

  // --- 2. 정책 검증 ---

  private async validatePolicies(account: ManagerAccount) {
    await this.LoginGuard.throwIf(
      account.status === AccountStatus.PENDING_VERIFICATION,
      'ACCOUNT_NOT_VERIFIED',
    );
    await this.LoginGuard.throwIf(
      account.status === AccountStatus.INACTIVE,
      'INACTIVE_ACCOUNT',
    );
    await this.LoginGuard.throwIf(
      account.manager?.status === ManagerStatus.INACTIVE,
      'INACTIVE_MANAGER',
    );
    await this.LoginGuard.throwIf(
      account.manager?.organization?.status === OrganizationStatus.INACTIVE,
      'INACTIVE_ORGANIZATION',
    );

    // 휴면 계정 확인
    if (account.lastLoginAt) {
      const dormancyPeriodMs = 90 * 24 * 60 * 60 * 1000;
      const isDormant = Date.now() - account.lastLoginAt.getTime() > dormancyPeriodMs;
      await this.LoginGuard.throwIf(isDormant, 'DORMANT_ACCOUNT');
    }
  }

  // --- 3. 자격 증명 확인 ---

  private async verifyCredentials(account: ManagerAccount, password: string) {
    const isPasswordValid = await CryptoUtil.comparePassword(password, account.password);
    await this.LoginGuard.assert(isPasswordValid, 'INVALID_CREDENTIALS', { context: { email: account.email } });
  }

  // --- 4. 성공 처리 및 응답 ---

  private async processLoginSuccess(account: ManagerAccount, clientIp: string) {
    // 실패 이력 초기화
    await Promise.all([
      this.redisService.del(this.loginKeys.build('attempt', account.email)),
      this.redisService.del(this.loginKeys.build('lock', account.email)),
    ]);

    // 접속 정보 업데이트
    account.lastLoginAt = new Date();
    account.lastLoginIp = clientIp;

    // 비밀번호 만료 확인
    const isPasswordExpired = !account.passwordExpiresAt || account.passwordExpiresAt.getTime() < Date.now();

    // 토큰 생성 (만료된 경우 제한된 페이로드 포함)
    const organizationId = account.manager?.organization?.id;
    const mustCreateOrganization = !organizationId;
    const tokens = await TokenUtil.generateTokens(this.jwtService, account.id, {
      organizationId,
      mustChangePassword: isPasswordExpired,
      mustCreateOrganization,
    });

    await this.redisService.set(
      `refresh:${account.id}`,
      tokens.refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return { ...tokens, mustCreateOrganization };
  }

  // --- 실패 처리 부수 효과 ---

  private async handleLoginFailure(email: string) {
    const attemptKey = this.loginKeys.build('attempt', email);

    const attempts = await this.redisService.incr(attemptKey);
    if (attempts === 1) await this.redisService.expire(attemptKey, ENV.LOGIN_ATTEMPT_TTL);

    if (attempts >= ENV.LOGIN_MAX_ATTEMPTS) {
      await this.redisService.set(this.loginKeys.build('lock', email), 'locked', ENV.LOGIN_LOCK_TTL);
      await this.redisService.del(attemptKey);
    }
  }
}
