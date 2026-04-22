import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, ManagerAccount, ManagerAccountRepository } from '@pkg/database';

import { ENV } from '@/common/env';
import type { JWTPayload } from '@/common/types/request.type';
import { CryptoUtil } from '@/common/utils/crypto.util';
import { RedisService } from '@/modules/redis/redis.service';

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly clientIp: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);
  private readonly maxLoginAttempts = 5;
  private readonly loginAttemptTtlSeconds = 15 * 60;
  private readonly loginLockTtlSeconds = 15 * 60;
  private readonly passwordExpiryDays = 90;

  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  @Transactional()
  async execute(command: LoginCommand) {
    const { password, clientIp } = command;
    const email = this.normalizeEmail(command.email);
    this.logger.log(`Executing LoginCommand for user: ${email}`);

    // 1. Redis 기반 일시적 차단 확인 (Rate Limiting 용도)
    await this.assertLoginNotLocked(email);

    // 2. 계정 정보 조회 (상태 필드 포함)
    const managerAccount = await this.managerAccountRepository.findOne(
      { email },
      { populate: ['managers.organization'] },
    );

    if (!managerAccount) {
      await this.recordLoginFailure(email);
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // 3. 계정 정책 검증
    this.validateAccountStatus(managerAccount);

    // 4. 비밀번호 검증 및 응답 빌드
    const tenantContext = this.resolveManagerTenantContext(managerAccount);
    return this.buildLoginResponse(managerAccount, password, clientIp, tenantContext);
  }

  private validateAccountStatus(account: ManagerAccount) {
    // 활성 상태 확인
    if (account.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException('비활성화된 계정입니다. 관리자에게 문의하세요.');
    }

    // 잠금 상태 확인 및 자동 해제 로직
    if (account.status === AccountStatus.LOCKED) {
      if (account.lockUntil && account.lockUntil < new Date()) {
        // 잠금 시간 경과 시 자동 해제
        account.status = AccountStatus.ACTIVE;
        account.loginAttempts = 0;
        account.lockUntil = null;
      }
      else {
        throw new UnauthorizedException('로그인 시도가 너무 많아 계정이 잠겼습니다. 잠시 후 다시 시도하세요.');
      }
    }
  }

  private async recordLoginFailure(email: string, account?: ManagerAccount) {
    // 1. Redis 기반 실패 기록 (일시적 차단용)
    const attemptKey = this.createLoginAttemptKey(email);
    const lockKey = this.createLoginLockKey(email);

    const attempts = await this.redisService.incr(attemptKey);
    if (attempts === 1) {
      await this.redisService.expire(attemptKey, this.loginAttemptTtlSeconds);
    }

    if (attempts >= this.maxLoginAttempts) {
      await this.redisService.set(lockKey, 'locked', this.loginLockTtlSeconds);
      await this.redisService.del(attemptKey);
    }

    // 2. DB 기반 실패 기록 (영구/계정 잠금용)
    if (account) {
      account.loginAttempts += 1;
      if (account.loginAttempts >= this.maxLoginAttempts) {
        account.status = AccountStatus.LOCKED;
        account.lockUntil = new Date(Date.now() + this.loginLockTtlSeconds * 1000);
      }
    }
  }

  private async resetLoginFailures(email: string, account: ManagerAccount) {
    // 1. Redis 초기화
    await Promise.all([
      this.redisService.del(this.createLoginAttemptKey(email)),
      this.redisService.del(this.createLoginLockKey(email)),
    ]);

    // 2. DB 초기화
    account.loginAttempts = 0;
    account.lockUntil = null;
    account.status = AccountStatus.ACTIVE;
  }

  private async buildLoginResponse(
    account: ManagerAccount,
    password: string,
    clientIp: string,
    tenantContext: {
      tenantId?: string
    },
  ) {
    const isPasswordMatch = await CryptoUtil.comparePassword(password, account.password);
    if (!isPasswordMatch) {
      await this.recordLoginFailure(account.email, account);
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // 성공 시 실패 기록 초기화 및 마지막 로그인 갱신
    await this.resetLoginFailures(account.email, account);
    account.lastLoginAt = new Date();
    account.lastLoginIp = clientIp;

    // 비밀번호 정책 체크 (만료 여부)
    const isPasswordExpired = this.checkPasswordExpiry(account);
    const passwordChangeRequired = account.forcePasswordChange || isPasswordExpired;

    const sid = randomUUID();
    const payload: JWTPayload = {
      sub: account.id,
      email: account.email,
      tenantId: tenantContext.tenantId,
      sid,
      passwordChangeRequired,
    };

    // 단일 세션 보장: Redis에 현재 유효한 세션 ID 저장
    await this.redisService.set(
      `active_session:${account.id}`,
      sid,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: ENV.JWT_REFRESH_SECRET,
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
    });

    await this.redisService.set(
      `refresh:${account.id}`,
      refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return {
      userId: account.id,
      email: account.email,
      clientIp,
      tenantId: tenantContext.tenantId,
      accessToken,
      refreshToken,
      passwordChangeRequired,
    };
  }

  private checkPasswordExpiry(account: ManagerAccount): boolean {
    const now = Date.now();
    const targetTime = account.nextPasswordChangeAt.getTime();
    return now > targetTime;
  }

  private createLoginAttemptKey(email: string) {
    return `login_attempt:${email}`;
  }

  private createLoginLockKey(email: string) {
    return `login_lock:${email}`;
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async assertLoginNotLocked(email: string) {
    const lockKey = this.createLoginLockKey(email);
    const lockTtl = await this.redisService.ttl(lockKey);
    if (lockTtl > 0) {
      throw new UnauthorizedException('로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요.');
    }
  }

  private resolveManagerTenantContext(account: ManagerAccount) {
    // 활성 상태인 매니저 정보만 필터링
    const activeManagers = account.managers?.getItems().filter((m) => m.status === 'ACTIVE') || [];
    const organization = activeManagers[0]?.organization;
    return {
      tenantId: organization?.id,
    };
  }
}
