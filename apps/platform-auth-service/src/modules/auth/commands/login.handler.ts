import { Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ManagerAccountRepository, UserAccountRepository } from '@pkg/database';

import { ENV } from '@/common/env';
import { CryptoUtil } from '@/common/utils/crypto.util';
import type { JWTPayload } from '@/common/types/request.type';

import { RedisService } from '../../redis/redis.service';

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

  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async execute(command: LoginCommand) {
    const { password, clientIp } = command;
    const email = this.normalizeEmail(command.email);
    this.logger.log(`Executing LoginCommand for user: ${email}`);

    await this.assertLoginNotLocked(email);

    const managerAccount = await this.managerAccountRepository.findOne(
      { email },
      { populate: ['managers.organization'] },
    );
    if (managerAccount) {
      const tenantContext = this.resolveManagerTenantContext(managerAccount);
      return this.buildLoginResponse({
        id: managerAccount.id,
        email: managerAccount.email,
        password: managerAccount.password,
        accountType: 'manager',
      }, password, clientIp, tenantContext);
    }

    const userAccount = await this.userAccountRepository.findOne(
      { email },
      { populate: ['site.organization'] },
    );
    if (userAccount) {
      const tenantContext = this.resolveUserTenantContext(userAccount);
      return this.buildLoginResponse({
        id: userAccount.id,
        email: userAccount.email,
        password: userAccount.password,
        accountType: 'user',
      }, password, clientIp, tenantContext);
    }

    await this.recordLoginFailure(email);
    throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
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

  private async recordLoginFailure(email: string) {
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
  }

  private async resetLoginFailures(email: string) {
    await Promise.all([
      this.redisService.del(this.createLoginAttemptKey(email)),
      this.redisService.del(this.createLoginLockKey(email)),
    ]);
  }

  private resolveManagerTenantContext(account: { managers?: { getItems: () => Array<{ organization?: { id: string } | null }> } }) {
    const organization = account.managers?.getItems()[0]?.organization;
    return {
      tenantId: organization?.id,
      tenantType: organization ? 'organization' as const : undefined,
    };
  }

  private resolveUserTenantContext(account: { site?: { organization?: { id: string } | null } | null }) {
    const organization = account.site?.organization;
    return {
      tenantId: organization?.id,
      tenantType: organization ? 'organization' as const : undefined,
    };
  }

  private async buildLoginResponse(
    account: { id: string, email: string, password: string, accountType: 'manager' | 'user' },
    password: string,
    clientIp: string,
    tenantContext: {
      tenantId?: string
      tenantType?: 'organization' | 'site'
    },
  ) {
    const isPasswordMatch = await CryptoUtil.comparePassword(password, account.password);
    if (!isPasswordMatch) {
      await this.recordLoginFailure(account.email);
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    await this.resetLoginFailures(account.email);

    const payload: JWTPayload = {
      sub: account.id,
      email: account.email,
      accountType: account.accountType,
      tenantId: tenantContext.tenantId,
      tenantType: tenantContext.tenantType,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: ENV.JWT_REFRESH_SECRET,
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
    });

    // Redis에 Refresh Token 저장 (Key: auth:refresh:<userId>, TTL 설정)
    await this.redisService.set(
      `refresh:${account.id}`,
      refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return {
      userId: account.id,
      email: account.email,
      accountType: account.accountType,
      clientIp,
      tenantId: tenantContext.tenantId,
      tenantType: tenantContext.tenantType,
      accessToken,
      refreshToken,
    };
  }
}
