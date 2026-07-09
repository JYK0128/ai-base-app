import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OrganizationRole } from '@pkg/database';

import { OrganizationRoleAsserter } from '../organization-role.errors';
import { UpdateOrganizationRoleContract } from './update-organization-role.contract';
import { UpdateOrganizationRoleResponseDto } from './update-organization-role.response.dto';

const RESERVED_ROLE_CODES = new Set(['OWNER', 'MANAGER', 'VIEWER']);

@CommandHandler(UpdateOrganizationRoleContract)
export class UpdateOrganizationRoleHandler implements ICommandHandler<UpdateOrganizationRoleContract> {
  private readonly Asserter = OrganizationRoleAsserter;

  @Transactional()
  async execute(command: UpdateOrganizationRoleContract): Promise<UpdateOrganizationRoleResponseDto> {
    const role = await this.identifyRole(command.data.id);
    const nextCode = command.data.code?.trim().toUpperCase();
    const nextName = command.data.name?.trim();
    const nextDescription = command.data.description?.trim();

    await this.verifyUpdate(role, nextCode);
    this.processUpdate(role, nextCode, nextName, nextDescription);

    return new UpdateOrganizationRoleResponseDto(role.id);
  }

  private async identifyRole(id: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      OrganizationRole.findOne({ id }, { populate: ['organization'] }),
      'ORGANIZATION_ROLE_LOAD_FAILED',
    );
  }

  private async verifyUpdate(role: OrganizationRole, nextCode: string | undefined): Promise<void> {
    if (nextCode !== undefined && RESERVED_ROLE_CODES.has(role.code) && nextCode !== role.code) {
      await this.Asserter.throw('ORGANIZATION_ROLE_PROTECTED');
    }

    if (nextCode === undefined) {
      return;
    }

    const existingRole = await OrganizationRole.findOne({
      organization: role.organization,
      code: nextCode,
      id: { $ne: role.id },
    });

    if (existingRole) {
      await this.Asserter.throw('ORGANIZATION_ROLE_ALREADY_EXISTS');
    }
  }

  private processUpdate(
    role: OrganizationRole,
    nextCode: string | undefined,
    nextName: string | undefined,
    nextDescription: string | undefined,
  ): void {
    const description = nextDescription || null;

    if (RESERVED_ROLE_CODES.has(role.code)) {
      if (nextName !== undefined) {
        role.name = nextName;
      }
      if (nextDescription !== undefined) {
        role.description = description;
      }
      return;
    }

    if (nextCode !== undefined) {
      role.code = nextCode;
    }
    if (nextName !== undefined) {
      role.name = nextName;
    }
    if (nextDescription !== undefined) {
      role.description = description;
    }
  }
}
