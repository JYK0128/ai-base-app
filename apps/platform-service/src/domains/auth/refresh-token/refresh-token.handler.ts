import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { JwtUtil } from '@pkg/shared';

import { ENV } from '@/env';

import { AuthCacheService } from '../auth.cache';
import { AuthRefreshTokenContract } from './refresh-token.contract';
import { RefreshTokenAsserter } from './refresh-token.error';
import type { AuthRefreshTokenResponseDto } from './refresh-token.response.dto';

@CommandHandler(AuthRefreshTokenContract)
export class RefreshTokenHandler implements ICommandHandler<AuthRefreshTokenContract> {
  private readonly Asserter = RefreshTokenAsserter;

  constructor(
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
    private readonly authCacheService: AuthCacheService,
  ) {}

  @Transactional()
  async execute(command: AuthRefreshTokenContract): Promise<AuthRefreshTokenResponseDto & { refreshToken: string }> {
    const { refreshToken } = command.data;

    const account = await this.identifyAccount(refreshToken);
    await this.validatePolicies(account);

    return this.processTokenRotation(account);
  }

  private async verifyToken(token: string): Promise<{ sub: string }> {
    const payload = await this.Asserter.assert(
      JwtUtil.verify<{ sub: string }>(token, ENV.JWT_REFRESH_SECRET),
      'INVALID_TOKEN',
    );

    return payload;
  }

  private async verifySession(accountId: string, token: string) {
    const storedToken = await this.authCacheService.get<string>(`refresh:${accountId}`);
    await this.Asserter.throwIf(!storedToken || storedToken !== token, 'SESSION_EXPIRED');
  }

  private async identifyAccount(refreshToken: string): Promise<MemberAccount> {
    const payload = await this.verifyToken(refreshToken);
    const accountId = payload.sub;
    await this.verifySession(accountId, refreshToken);

    const account = await this.Asserter.assert(
      this.memberAccountRepository.findOne(
        { id: accountId },
        { populate: ['member.organization', 'member.roles.role.permissions.resource'] },
      ),
      'ACCOUNT_NOT_FOUND',
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
  }

  private async processTokenRotation(account: MemberAccount) {
    const accountId = account.id;
    const accessExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_ACCESS_EXPIRES_IN;
    const refreshExpiresAt = Math.floor(Date.now() / 1000) + ENV.JWT_REFRESH_EXPIRES_IN;

    const tokens = await JwtUtil.issuePair(
      {
        sub: accountId,
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
}
