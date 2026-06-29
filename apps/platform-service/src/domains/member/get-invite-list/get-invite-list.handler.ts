import type { FilterQuery } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MemberInvite, Organization } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { GetInviteListContract } from './get-invite-list.contract';
import { GetInviteListResponseDto, InviteListItem } from './get-invite-list.response.dto';

@QueryHandler(GetInviteListContract)
export class GetInviteListHandler implements IQueryHandler<GetInviteListContract> {
  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetInviteListContract): Promise<GetInviteListResponseDto> {
    const organization = await this.identifyOrganization();
    this.verifyInviteList(organization, query);
    return this.processList(query, organization);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      throw new Error('Organization context not found.');
    }

    return Organization.getReference(organization.id);
  }

  private verifyInviteList(_organization: Organization, _query: GetInviteListContract): void {
    // 초대 이력 조회 정책 검증 영역
  }

  private async processList(
    query: GetInviteListContract,
    organization: Organization,
  ): Promise<GetInviteListResponseDto> {
    const where = {
      organization,
      deletedAt: null,
      ...query.data.toFilterQuery(),
    } as FilterQuery<MemberInvite>;
    const inviteCursor = await MemberInvite.findByCursor({
      where,
      populate: ['role'],
      ...query.data.toCursorOptions(),
    });

    return new GetInviteListResponseDto({
      items: inviteCursor.items.map((invite) => new InviteListItem(invite)),
      startCursor: inviteCursor.startCursor,
      endCursor: inviteCursor.endCursor,
      hasNextPage: inviteCursor.hasNextPage,
      hasPrevPage: inviteCursor.hasPrevPage,
      totalCount: inviteCursor.totalCount,
      length: inviteCursor.length,
    });
  }
}
