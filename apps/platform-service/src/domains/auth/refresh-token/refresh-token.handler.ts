import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { JwtUtil } from '@pkg/shared';

import { ENV } from '@/env';

import { AuthCacheService } from '../auth.cache';
import { extractPermissions } from '../auth.helper';
import { RefreshTokenContract } from './refresh-token.contract';
import { RefreshTokenAsserter } from './refresh-token.error';
import type { RefreshTokenResponseDto } from './refresh-token.response.dto';

@CommandHandler(RefreshTokenContract)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenContract> {
  private readonly Asserter = RefreshTokenAsserter;

  constructor(
    private readonly authService: AuthCacheService,
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
  ) {}

  async execute(command: RefreshTokenContract): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = command.data;

    const payload = await this.verifyToken(refreshToken);
    const accountId = payload.sub;
    await this.verifySession(accountId, refreshToken);

    const account = await this.identifyAccount(accountId);
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
    const storedToken = await this.authService.get<string>(`refresh:${accountId}`);
    await this.Asserter.throwIf(!storedToken || storedToken !== token, 'SESSION_EXPIRED');
  }

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

  private async validatePolicies(account: MemberAccount) {
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
    await this.Asserter.throwIf(!account.member.isActive, 'INACTIVE_MEMBER');

    const organization = account.member.organization;
    if (organization) {
      await this.Asserter.throwIf(!organization.isActive, 'INACTIVE_ORGANIZATION');
    }
  }

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
        organizationId,
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

    await this.authService.set(
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
