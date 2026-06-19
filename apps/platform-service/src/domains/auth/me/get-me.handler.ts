import { InjectRepository } from '@mikro-orm/nestjs';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { AuthGetMeContract } from './get-me.contract';
import { GetMeAsserter } from './get-me.error';
import { AuthGetMeResponseDto } from './get-me.response.dto';

@QueryHandler(AuthGetMeContract)
export class GetMeHandler implements IQueryHandler<AuthGetMeContract> {
  private readonly Asserter = GetMeAsserter;

  constructor(
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
    private readonly cls: ClsService,
  ) {}

  async execute(_query: AuthGetMeContract): Promise<AuthGetMeResponseDto> {
    const accountId = await this.identifyAccountId();
    const account = await this.identifyAccount(accountId);
    const permissions = await this.identifyPermissions();
    const agreedTermsVersionIds = await this.identifyAgreedTermsVersionIds();
    const mustAcceptTerms = await this.identifyMustAcceptTerms();

    return new AuthGetMeResponseDto({
      account,
      permissions,
      agreedTermsVersionIds,
      mustAcceptTerms,
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
          'member.roles.organization',
          'member.roles.role.permissions.resource',
        ],
      },
    );

    return this.Asserter.assert(account, 'ACCOUNT_NOT_FOUND');
  }

  private async identifyPermissions(): Promise<string[]> {
    const permissions = this.cls.get('permissions');
    if (!Array.isArray(permissions)) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return permissions;
  }

  private async identifyAgreedTermsVersionIds(): Promise<string[]> {
    const agreedTermsVersionIds = this.cls.get('agreedTermsVersionIds');
    if (!Array.isArray(agreedTermsVersionIds)) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return agreedTermsVersionIds;
  }

  private async identifyMustAcceptTerms(): Promise<boolean> {
    const mustAcceptTerms = this.cls.get('mustAcceptTerms');
    if (typeof mustAcceptTerms !== 'boolean') {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return mustAcceptTerms;
  }
}
