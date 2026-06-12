import { InjectRepository } from '@mikro-orm/nestjs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetMeAsserter } from '../auth.errors';
import { extractPermissions } from '../auth.service';
import { type AuthMeUserInfo, mapAuthMeUserInfo } from '../auth.types';

/**
 * 내 정보 조회 유스케이스
 */
export class GetMeUseCase {
  private readonly Asserter = GetMeAsserter;

  constructor(
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<AuthMeUserInfo> {
    const accountId = await this.identifyAccountId();
    const account = await this.identifyAccount(accountId);
    const organizationId = account.member.organization?.id;
    const { permissions } = extractPermissions(account.member, organizationId);

    return mapAuthMeUserInfo(account, permissions);
  }

  private async identifyAccountId(): Promise<string> {
    const accountId = this.cls.get('accountId');

    if (!accountId) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return accountId;
  }

  private async identifyAccount(accountId: string): Promise<MemberAccount> {
    const account = await this.memberAccountRepository.findOne(
      { id: accountId },
      {
        populate: [
          'member.organization',
          'member.organizationRoles.organization',
          'member.organizationRoles.role.permissions.resource',
        ],
      },
    );

    return this.Asserter.assert(account, 'ACCOUNT_NOT_FOUND');
  }
}
