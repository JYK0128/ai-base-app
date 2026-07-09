import type { FilterQuery } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MemberInvite, Organization } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { GetInvitePageContract } from './get-invite-page.contract';
import { GetInvitePageResponseDto, InvitePageItem } from './get-invite-page.response.dto';

@QueryHandler(GetInvitePageContract)
export class GetInvitePageHandler implements IQueryHandler<GetInvitePageContract> {
  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetInvitePageContract): Promise<GetInvitePageResponseDto> {
    const organization = await this.identifyOrganization();
    this.verifyInvitePage(organization, query);
    return this.processPage(query, organization);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      throw new Error('Organization context not found.');
    }

    return Organization.getReference(organization.id);
  }

  private verifyInvitePage(_organization: Organization, _query: GetInvitePageContract): void {
    // 초대 이력 조회 정책 검증 영역
  }

  private async processPage(
    query: GetInvitePageContract,
    organization: Organization,
  ): Promise<GetInvitePageResponseDto> {
    const invitePage = await MemberInvite.findByPage(
      {
        organization,
        ...query.data.toFilterQuery(),
      } as FilterQuery<MemberInvite>,
      {
        populate: ['role'],
        ...query.data.toPageOptions(),
      },
    );

    return new GetInvitePageResponseDto({
      ...invitePage,
      items: invitePage.items.map((invite) => new InvitePageItem(invite)),
    });
  }
}
