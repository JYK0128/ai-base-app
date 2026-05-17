import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ManagerAccount, ManagerAccountRepository } from '@pkg/database';

import { ENV } from '@/common/env';
import { TokenUtil } from '@/common/utils/token.util';
import { RedisService } from '@/modules/redis/redis.service';

import { extractPermissions } from '../auth.helpers';
import { LoginAsserter, LoginCommand } from './login.helpers';

/**
 * 로그인 처리 핸들러
 */
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly loginKeys = RedisService.for('login');
  private readonly Asserter = LoginAsserter.onFail(({ code, context }) => {
    if (code === 'INVALID_CREDENTIALS' && context) {
      return this.handleLoginFailure(context.email);
    }
  });

  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly redisService: RedisService,
  ) {}

  @Transactional()
  async execute({ email, password, clientIp }: LoginCommand) {
    const account = await this.identifyAccount(email);
    await this.validatePolicies(account);
    await this.verifyCredentials(account, password);

    return this.processLoginSuccess(account, clientIp);
  }

  /**
   * STEP 1: 식별 및 계정 확보
   */
  private async identifyAccount(email: string) {
    const lockTtl = await this.redisService.ttl(this.loginKeys.build('lock', email));
    await this.Asserter.throwIf(lockTtl > 0, 'ACCOUNT_LOCKED', {
      metadata: {
        remainingAttempts: 0,
        retryAfterSeconds: lockTtl,
        lockedUntil: new Date(Date.now() + lockTtl * 1000).toISOString(),
      },
    });

    return await this.Asserter.assert(
      this.managerAccountRepository.findOne(
        { email },
        { populate: ['manager.organization', 'manager.roles.role.permissions.permission'] },
      ),
      'INVALID_CREDENTIALS',
      { context: { email } },
    );
  }

  /**
   * STEP 2: 정책 검증
   */
  private async validatePolicies(account: ManagerAccount) {
    await this.Asserter.throwIf(!account.isActive(), 'INACTIVE_ACCOUNT');
    await this.Asserter.throwIf(!account.manager.isActive(), 'INACTIVE_MANAGER');
    await this.Asserter.throwIf(!account.manager.organization?.isActive(), 'INACTIVE_ORGANIZATION');

    // 휴면 계정 확인
    await this.Asserter.throwIf(account.isDormant(), 'DORMANT_ACCOUNT');
  }

  /**
   * STEP 3: 자격 증명 확인
   */
  private async verifyCredentials(account: ManagerAccount, password: string) {
    const isPasswordValid = account.verifyPassword(password);
    await this.Asserter.assert(isPasswordValid, 'INVALID_CREDENTIALS', {
      context: { email: account.email },
    });
  }

  /**
   * STEP 4: 성공 처리 및 응답
   */
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
    const isPasswordExpired = account.isPasswordExpired();

    const organizationId = account.manager?.organization?.id;

    // 권한 정보 조회
    const { roles, permissions } = extractPermissions(account.manager, organizationId);

    // 토큰 생성
    const tokens = await TokenUtil.generateTokens({
      sub: account.id,
      organizationId,
      mustChangePassword: isPasswordExpired,
      roles,
      permissions,
    });

    await this.redisService.set(
      `refresh:${account.id}`,
      tokens.refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return tokens;
  }

  /**
   * STEP 5: 실패 처리 부수 효과
   */
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
