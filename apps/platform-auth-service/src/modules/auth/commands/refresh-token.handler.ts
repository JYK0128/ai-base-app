import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ManagerAccount, ManagerAccountRepository } from '@pkg/database';

import { ENV } from '@/common/env';
import type { JWTPayload } from '@/common/types/request.type';
import { TokenUtil } from '@/common/utils/token.util';
import { RedisService } from '@/modules/redis/redis.service';

import { extractPermissions } from '../auth.helpers';
import { RefreshTokenAsserter, RefreshTokenCommand } from './refresh-token.helpers';

/**
 * 리프레시 토큰 처리 핸들러
 */
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  private readonly logger = new Logger(RefreshTokenHandler.name);
  private readonly Asserter = RefreshTokenAsserter;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly managerAccountRepository: ManagerAccountRepository,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { refreshToken } = command;

    const payload = await this.verifyToken(refreshToken);
    await this.verifySession(payload.sub, refreshToken);

    const account = await this.identifyAccount(payload.sub);
    await this.validatePolicies(account, payload.organizationId);

    return this.processTokenRotation(account, payload.organizationId);
  }

  /**
   * STEP 1: JWT 검증
   */
  private async verifyToken(token: string): Promise<JWTPayload> {
    const payload = await this.Asserter.assert(
      this.jwtService.verifyAsync<JWTPayload>(token, { secret: ENV.JWT_REFRESH_SECRET }),
      'INVALID_TOKEN',
    );

    await this.Asserter.throwIf(payload.typ !== 'refresh', 'INVALID_TOKEN_TYPE');

    return payload;
  }

  /**
   * STEP 2: 세션 일치 확인 (Redis)
   */
  private async verifySession(id: string, token: string) {
    const storedToken = await this.redisService.get(`refresh:${id}`);
    await this.Asserter.throwIf(!storedToken || storedToken !== token, 'SESSION_EXPIRED');
  }

  /**
   * STEP 3: 계정 식별
   */
  private async identifyAccount(id: string): Promise<ManagerAccount> {
    return await this.Asserter.assert(
      this.managerAccountRepository.findOne(
        { id },
        { populate: ['manager.organization', 'manager.roles.role.permissions.permission'] },
      ),
      'ACCOUNT_NOT_FOUND',
    );
  }

  /**
   * STEP 4: 정책 검증
   */
  private async validatePolicies(account: ManagerAccount, organizationId?: string) {
    // 4-1. 계정 및 매니저 활성화 확인
    await this.Asserter.throwIf(!account.isActive(), 'INACTIVE_ACCOUNT');
    await this.Asserter.throwIf(!account.manager.isActive(), 'INACTIVE_MANAGER');

    // 4-2. 조직 활성화 확인 (Organization 관점)
    const organization = await this.Asserter.assert(
      account.manager.organization,
      'NOT_BELONG_TO_ORGANIZATION',
    );
    await this.Asserter.throwIf(!organization.isActive(), 'INACTIVE_ORGANIZATION');

    // 4-3. (선택) 요청 조직 소속 여부 재검증
    if (organizationId) {
      await this.Asserter.throwIf(organization.is(organizationId), 'INVALID_TOKEN');
    }
  }

  /**
   * STEP 5: 토큰 로테이션 및 결과 반환
   */
  private async processTokenRotation(account: ManagerAccount, organizationId?: string) {
    const { roles, permissions } = extractPermissions(account.manager, organizationId);

    const tokens = await TokenUtil.generateTokens({
      sub: account.id,
      organizationId,
      mustChangePassword: account.isPasswordExpired(),
      roles,
      permissions,
    });

    await this.redisService.set(
      `refresh:${account.id}`,
      tokens.refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return {
      id: account.id,
      ...tokens,
      organizationId,
    };
  }
}
