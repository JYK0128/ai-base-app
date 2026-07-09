import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OrganizationRole, OrganizationRoleAssignment } from '@pkg/database';

import { OrganizationRoleAsserter } from '../organization-role.errors';
import { DeleteOrganizationRoleContract } from './delete-organization-role.contract';
import { DeleteOrganizationRoleResponseDto } from './delete-organization-role.response.dto';

const RESERVED_ROLE_CODES = new Set(['OWNER', 'MANAGER', 'VIEWER']);

@CommandHandler(DeleteOrganizationRoleContract)
export class DeleteOrganizationRoleHandler implements ICommandHandler<DeleteOrganizationRoleContract> {
  private readonly Asserter = OrganizationRoleAsserter;

  @Transactional()
  async execute(command: DeleteOrganizationRoleContract): Promise<DeleteOrganizationRoleResponseDto> {
    const role = await this.identifyRole(command.data.id);
    await this.verifyDelete(role);
    role.remove();

    return new DeleteOrganizationRoleResponseDto(role.id);
  }

  private async identifyRole(id: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      OrganizationRole.findOne({ id }, { populate: ['organization'] }),
      'ORGANIZATION_ROLE_LOAD_FAILED',
    );
  }

  private async verifyDelete(role: OrganizationRole): Promise<void> {
    if (RESERVED_ROLE_CODES.has(role.code)) {
      await this.Asserter.throw('ORGANIZATION_ROLE_PROTECTED');
    }

    const assignmentCount = await OrganizationRoleAssignment.count({ role });

    if (assignmentCount > 0) {
      await this.Asserter.throw('ORGANIZATION_ROLE_HAS_ASSIGNMENTS');
    }
  }
}
