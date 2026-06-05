import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberAccount, MemberAccountRepository } from '@pkg/database';
import { JwtUtil } from '@pkg/shared/common';

import { ENV } from '@/env';
import { RedisService } from '@/modules/redis/redis.service';

import { extractPermissions } from '../auth.helpers';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenAsserter } from './refresh-token.error';

/**
 * 리프레시 토큰 처리 핸들러
 */
type RefreshTokenPayload = {
  sub: string
};

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  private readonly logger = new Logger(RefreshTokenHandler.name);
  private readonly Asserter = RefreshTokenAsserter;

  constructor(
    private readonly redisService: RedisService,
    private readonly memberAccountRepository: MemberAccountRepository,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { refreshToken } = command;

    const payload = await this.verifyToken(refreshToken);
    const accountId = payload.sub;
    await this.verifySession(accountId, refreshToken);

    const account = await this.identifyAccount(accountId);
    await this.validatePolicies(account);

    return this.processTokenRotation(account);
  }

  /**
   * STEP 1: JWT 검증
   */
  private async verifyToken(token: string): Promise<RefreshTokenPayload> {
    const payload = await this.Asserter.assert(
      JwtUtil.verify<RefreshTokenPayload>(token, ENV.JWT_REFRESH_SECRET),
      'INVALID_TOKEN',
    );

    return payload;
  }

  /**
   * STEP 2: 세션 일치 확인 (Redis)
   */
  private async verifySession(accountId: string, token: string) {
    const storedToken = await this.redisService.get(`refresh:${accountId}`);
    await this.Asserter.throwIf(!storedToken || storedToken !== token, 'SESSION_EXPIRED');
  }

  /**
   * STEP 3: 계정 식별
   */
  private async identifyAccount(accountId: string): Promise<MemberAccount> {
    const account = await this.Asserter.assert(
      this.memberAccountRepository.findOne(
        { id: accountId },
        { populate: ['member.organization', 'member.organizationRoles.role.permissions.resource'] },
      ),
      'ACCOUNT_NOT_FOUND',
    );

    return account;
  }

  /**
   * STEP 4: 정책 검증
   */
  private async validatePolicies(account: MemberAccount) {
    // 4-1. 계정 및 매니저 활성화 확인
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
    await this.Asserter.throwIf(!account.member.isActive, 'INACTIVE_MEMBER');

    const organization = account.member.organization;
    if (organization) {
      await this.Asserter.throwIf(!organization.isActive, 'INACTIVE_ORGANIZATION');
    }
  }

  /**
   * STEP 5: 토큰 로테이션 및 결과 반환
   */
  private async processTokenRotation(account: MemberAccount) {
    const organizationId = account.member.organization?.id;
    const { permissions } = extractPermissions(account.member, organizationId);
    const accountId = account.id;
    const memberId = account.member.id;
    const accessExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_ACCESS_EXPIRES_IN;
    const refreshExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_REFRESH_EXPIRES_IN;

    const tokens = await JwtUtil.issuePair(
      {
        sub: accountId,
        accountId,
        memberId,
        ...(organizationId ? { organizationId } : {}),
        mustChangePassword: account.isPasswordExpired,
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

    await this.redisService.set(
      `refresh:${account.id}`,
      tokens.refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return {
      id: account.id,
      ...tokens,
    };
  }
}
