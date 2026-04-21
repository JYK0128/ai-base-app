import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ManagerAccountRepository } from '@pkg/database';

import { resolveManagerPermissionSet } from './permissions.util';

type PermissionContext = {
  userId: string
  email: string
  tenantId?: string
  roles: string[]
  permissions: string[]
};

export class GetPermissionsQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId?: string,
  ) {}
}

@QueryHandler(GetPermissionsQuery)
export class GetPermissionsHandler implements IQueryHandler<GetPermissionsQuery> {
  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
  ) {}

  async execute(query: GetPermissionsQuery): Promise<PermissionContext> {
    const managerAccount = await this.managerAccountRepository.findOne(
      { id: query.userId },
      { populate: ['managers.organization'] },
    );

    if (managerAccount) {
      const { roles, permissions } = resolveManagerPermissionSet(
        managerAccount.managers.getItems(),
        query.tenantId,
      );
      return {
        userId: managerAccount.id,
        email: managerAccount.email,
        tenantId: query.tenantId ?? managerAccount.managers.getItems()[0]?.organization?.id,
        roles,
        permissions,
      };
    }

    throw new NotFoundException('권한 정보를 찾을 수 없습니다.');
  }
}
