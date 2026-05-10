import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountStatus,
         ManagerAccount,
         ManagerAccountRepository,
         ManagerRoleRepository,
         ManagerStatus } from '@pkg/database';

export interface GetPermissionsResult {
  roles: string[]
  permissions: string[]
}

export class GetPermissionsQuery {
  constructor(
    public readonly id: string,
    public readonly organizationId?: string,
  ) {}
}

@QueryHandler(GetPermissionsQuery)
export class GetPermissionsHandler implements IQueryHandler<GetPermissionsQuery> {
  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly managerRoleRepository: ManagerRoleRepository,
  ) {}

  async execute(query: GetPermissionsQuery): Promise<GetPermissionsResult> {
    const { id, organizationId } = query;

    const account = await this.findExistingAccount(id);
    this.validateAccountStatus(account);
    this.validateOrganizationMembership(account, organizationId);

    return this.fetchEffectivePermissions(account.manager.id, organizationId);
  }

  /**
   * 계정 존재 여부 확인
   */
  private async findExistingAccount(id: string): Promise<ManagerAccount> {
    const account = await this.managerAccountRepository.findOne(
      { id },
      { populate: ['manager.organization'] },
    );

    if (!account) {
      throw new NotFoundException('계정을 찾을 수 없습니다.');
    }

    return account;
  }

  /**
   * 계정 전역 상태 검증 (ACTIVE/INACTIVE)
   */
  private validateAccountStatus(account: ManagerAccount) {
    if (account.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException('비활성화된 계정입니다. 관리자에게 문의하세요.');
    }
  }

  /**
   * 특정 조직에 대한 소속 여부 및 상태 검증
   */
  private validateOrganizationMembership(account: ManagerAccount, organizationId?: string) {
    if (!organizationId) return;

    const manager = account.manager;
    if (!manager || manager.organization?.id !== organizationId) {
      throw new UnauthorizedException('해당 조직에 대한 권한이 없습니다.');
    }

    if (manager.status === ManagerStatus.INACTIVE) {
      throw new UnauthorizedException('해당 조직에서 비활성화된 사용자입니다.');
    }
  }

  /**
   * DB 기반의 역할 및 권한 세트 조회
   */
  private async fetchEffectivePermissions(managerPk: string, organizationId?: string): Promise<GetPermissionsResult> {
    const managerRoles = await this.managerRoleRepository.find(
      {
        manager: managerPk,
        ...(organizationId ? { organization: organizationId } : {}),
      },
      { populate: ['role.permissions.permission'] },
    );

    const roles = new Set<string>();
    const permissions = new Set<string>();

    for (const mr of managerRoles) {
      const role = mr.role;
      roles.add(role.code);

      for (const rp of role.permissions) {
        permissions.add(rp.permission.code);
      }
    }

    return {
      roles: Array.from(roles),
      permissions: Array.from(permissions),
    };
  }
}
