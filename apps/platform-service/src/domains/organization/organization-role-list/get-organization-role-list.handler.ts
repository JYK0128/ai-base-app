import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { GetOrganizationRoleListContract } from './get-organization-role-list.contract';
import { GetOrganizationRoleListAsserter } from './get-organization-role-list.error';
import { GetOrganizationRoleListResponseDto, OrganizationRoleListItem } from './get-organization-role-list.response.dto';

@QueryHandler(GetOrganizationRoleListContract)
export class GetOrganizationRoleListHandler implements IQueryHandler<GetOrganizationRoleListContract> {
  private readonly Asserter = GetOrganizationRoleListAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<GetOrganizationRoleListResponseDto> {
    const organization = await this.identifyOrganization();
    this.verifyRoles(organization);
    return this.processList(organization);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Organization.findOne({ id: organization.id }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private verifyRoles(_organization: Organization): void {
    // 조직 권한 목록 조회 정책 검증 영역
  }

  private async processList(organization: Organization): Promise<GetOrganizationRoleListResponseDto> {
    const roles = await this.Asserter.assert(
      OrganizationRole.find(
        { organization },
        {
          orderBy: [{ sortOrder: 'ASC' }, { code: 'ASC' }, { createdAt: 'ASC' }],
        },
      ),
      'LOAD_FAILED',
    );

    return new GetOrganizationRoleListResponseDto({
      items: roles.map((role) => new OrganizationRoleListItem(role)),
    });
  }
}
