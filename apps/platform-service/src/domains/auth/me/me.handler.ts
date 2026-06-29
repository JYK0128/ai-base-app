import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { AuthAccountContext, AuthMemberContext, AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { MeContract } from './me.contract';
import { MeAsserter } from './me.error';
import { MeResponseDto } from './me.response.dto';

@QueryHandler(MeContract)
export class MeHandler implements IQueryHandler<MeContract> {
  private readonly Asserter = MeAsserter;

  constructor(private readonly cls: ClsService) {}

  async execute(_query: MeContract): Promise<MeResponseDto> {
    const account = await this.identifyAccount();
    const member = await this.identifyMember();
    const organization = await this.identifyOrganization();
    const permissions = await this.identifyPermissions();
    this.verifyMeContext(account, member, organization, permissions);

    return this.processProfile(_query, account, member, organization, permissions);
  }

  private verifyMeContext(
    _account: AuthAccountContext,
    _member: AuthMemberContext,
    _organization: AuthOrganizationContext | null,
    _permissions: string[],
  ): void {
    // 내 정보 조회 정책 검증 영역
  }

  private processProfile(
    _query: MeContract,
    account: AuthAccountContext,
    member: AuthMemberContext,
    organization: AuthOrganizationContext | null,
    permissions: string[],
  ): MeResponseDto {
    return new MeResponseDto({
      account,
      member,
      organization,
      permissions,
    });
  }

  private async identifyAccount(): Promise<AuthAccountContext> {
    const account = this.cls.get('account');
    if (!account) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return account;
  }

  private async identifyMember(): Promise<AuthMemberContext> {
    const member = this.cls.get('member');
    if (!member) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return member;
  }

  private async identifyOrganization(): Promise<AuthOrganizationContext | null> {
    const organization = this.cls.get('organization');
    return organization ?? null;
  }

  private async identifyPermissions(): Promise<string[]> {
    const permissions = this.cls.get('permissions');
    if (!Array.isArray(permissions)) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return permissions;
  }
}
