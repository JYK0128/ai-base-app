import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { GetRolePermissionListContract } from './get-role-permission-list.contract';
import { GetRolePermissionListAsserter } from './get-role-permission-list.error';
import { GetRolePermissionListResponseDto, RolePermissionListItem } from './get-role-permission-list.response.dto';

@QueryHandler(GetRolePermissionListContract)
export class GetRolePermissionListHandler implements IQueryHandler<GetRolePermissionListContract> {
  private readonly Asserter = GetRolePermissionListAsserter;

  constructor(private readonly cls: ClsService) {}

  async execute(): Promise<GetRolePermissionListResponseDto> {
    const organization = await this.identifyOrganization();
    this.verifyRoles(organization);
    return this.processList(organization);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organization.id);
  }

  private verifyRoles(_organization: Organization): void {
    // 권한 목록 조회 정책 검증 영역
  }

  private async processList(organization: Organization): Promise<GetRolePermissionListResponseDto> {
    const roles = await this.Asserter.assert(
      OrganizationRole.getQueryBuilder('role')
        .leftJoinAndSelect('permissions', 'permission')
        .leftJoinAndSelect('permission.resource', 'resource')
        .where({
          organization,
          deletedAt: null,
        })
        .getResultList(),
      'LOAD_FAILED',
    );

    return new GetRolePermissionListResponseDto({
      items: roles.map((role) => new RolePermissionListItem(role)),
    });
  }
}
