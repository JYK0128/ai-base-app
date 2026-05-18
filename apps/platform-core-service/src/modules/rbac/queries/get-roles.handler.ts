import { EntityManager } from '@mikro-orm/core';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Role } from '@pkg/database';

import { GetRolesAsserter, GetRolesCommand } from './get-roles.helpers';

export interface RoleDto {
  id: string
  code: string
  name: string
  scope: string
  description?: string
}

/**
 * 역할 목록 조회 핸들러
 */
@CommandHandler(GetRolesCommand)
export class GetRolesHandler implements ICommandHandler<GetRolesCommand> {
  private readonly Asserter = GetRolesAsserter;

  constructor(private readonly em: EntityManager) {}

  async execute(command: GetRolesCommand): Promise<RoleDto[]> {
    const roles = await this.identifyRoles();
    return this.processRoles(roles);
  }

  private async identifyRoles(): Promise<Role[]> {
    return await this.Asserter.assert(
      this.em.find(Role, {}, { orderBy: { code: 'ASC' } }),
      'LOAD_FAILED',
    );
  }

  private processRoles(roles: Role[]): RoleDto[] {
    return roles.map((role) => ({
      id: role.id,
      code: role.code,
      name: role.name,
      scope: role.scope,
      description: role.description,
    }));
  }
}
