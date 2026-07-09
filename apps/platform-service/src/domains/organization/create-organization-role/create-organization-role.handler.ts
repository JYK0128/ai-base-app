import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { OrganizationRoleAsserter } from '../organization-role.errors';
import { CreateOrganizationRoleContract } from './create-organization-role.contract';
import { CreateOrganizationRoleResponseDto } from './create-organization-role.response.dto';

const RESERVED_ROLE_CODES = new Set(['OWNER', 'MANAGER', 'VIEWER']);

@CommandHandler(CreateOrganizationRoleContract)
export class CreateOrganizationRoleHandler implements ICommandHandler<CreateOrganizationRoleContract> {
  private readonly Asserter = OrganizationRoleAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: CreateOrganizationRoleContract): Promise<CreateOrganizationRoleResponseDto> {
    const organization = await this.identifyOrganization();
    const code = command.data.code.trim().toUpperCase();
    const name = command.data.name.trim();
    const description = command.data.description?.trim();
    const sortOrder = command.data.sortOrder ?? (await OrganizationRole.count({ organization })) + 1;

    await this.verifyCreation(organization, code);
    const role = this.processCreation(organization, code, name, description, sortOrder);

    return new CreateOrganizationRoleResponseDto(role.id);
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

  private async verifyCreation(organization: Organization, code: string): Promise<void> {
    if (RESERVED_ROLE_CODES.has(code)) {
      await this.Asserter.throw('ORGANIZATION_ROLE_PROTECTED');
    }

    const existingRole = await OrganizationRole.findOne({ organization, code });

    if (existingRole) {
      await this.Asserter.throw('ORGANIZATION_ROLE_ALREADY_EXISTS');
    }
  }

  private processCreation(
    organization: Organization,
    code: string,
    name: string,
    description: string | undefined,
    sortOrder: number,
  ): OrganizationRole {
    return OrganizationRole.create({
      organization,
      code,
      name,
      description: description ?? null,
      sortOrder,
    });
  }
}
