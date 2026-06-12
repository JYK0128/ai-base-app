import { InjectRepository } from '@mikro-orm/nestjs';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { extractPermissions } from '../auth.helper';
import { GetMeAsserter } from './get-me.error';
import { GetMeQuery } from './get-me.query';
import { GetMeResponsePayload } from './get-me.response';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  private readonly Asserter = GetMeAsserter;

  constructor(
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
    private readonly cls: ClsService,
  ) {}

  async execute(_query: GetMeQuery): Promise<GetMeResponsePayload> {
    const accountId = await this.identifyAccountId();
    const account = await this.identifyAccount(accountId);
    const organizationId = account.member.organization?.id;
    const { permissions } = extractPermissions(account.member, organizationId);

    return new GetMeResponsePayload({
      account,
      permissions,
    });
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
