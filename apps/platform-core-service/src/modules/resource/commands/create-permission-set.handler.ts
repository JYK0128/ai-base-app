import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, Organization, OrganizationPermission, OrganizationRole, Resource } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildPermissionCode, buildPermissionSetRecord, normalizePermissionCodes, normalizeRoleCode } from '../permission-sets.helpers';
import { CreatePermissionSetCommand } from './create-permission-set.command';
import { CreatePermissionSetAsserter } from './create-permission-set.error';

@CommandHandler(CreatePermissionSetCommand)
export class CreatePermissionSetHandler implements ICommandHandler<CreatePermissionSetCommand> {
  private readonly Asserter = CreatePermissionSetAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: CoreRepository<Organization>,
    @InjectRepository(OrganizationRole)
    private readonly roleRepo: CoreRepository<OrganizationRole>,
    @InjectRepository(Resource)
    private readonly resourceRepo: CoreRepository<Resource>,
    @InjectRepository(OrganizationPermission)
    private readonly permissionRepo: CoreRepository<OrganizationPermission>,
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: CreatePermissionSetCommand) {
    const organization = await this.identifyOrganization();
    const normalizedCode = normalizeRoleCode(command.code);
    const sourceRole = await this.identifySourceRole(organization, command.copyFromId);

    const existingRole = await this.roleRepo.findOne({ organization, code: normalizedCode, deletedAt: null });
    await this.Asserter.throwIf(!!existingRole, 'ROLE_CODE_ALREADY_EXISTS');

    const availablePermissionLookup = await this.buildAvailablePermissionLookup();
    const copiedPermissionCodes = sourceRole
      ? sourceRole.permissions.getItems().map((permission) => buildPermissionCode(permission.resource.code, permission.action))
      : [];
    const permissionCodes = normalizePermissionCodes(copiedPermissionCodes);

    const role = this.roleRepo.create({
      organization,
      code: normalizedCode,
      name: command.name,
      description: command.description,
    });
    this.em.persist(role);

    for (const permissionCode of permissionCodes) {
      const permission = this.buildOrganizationPermission(role, permissionCode, availablePermissionLookup);
      this.em.persist(permission);
    }

    await this.em.flush();

    const createdRole = await this.loadRole(role.id, organization.id);
    return buildPermissionSetRecord(createdRole);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      this.organizationRepo.findOne({ id: organizationId }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async identifySourceRole(organization: Organization, copyFromId?: string): Promise<OrganizationRole | null> {
    if (!copyFromId) {
      return null;
    }

    return await this.Asserter.assert(
      this.roleRepo.findOne(
        { id: copyFromId, organization, deletedAt: null },
        { populate: ['permissions.resource'] },
      ),
      'SOURCE_ROLE_NOT_FOUND',
    );
  }

  private async buildAvailablePermissionLookup(): Promise<Map<string, Resource>> {
    const resources: Resource[] = await this.Asserter.assert(
      this.resourceRepo.find(
        {},
        {
          populate: ['parent'],
          orderBy: { sortOrder: 'ASC', code: 'ASC' },
        },
      ),
      'LOAD_FAILED',
    );

    const lookup = new Map<string, Resource>();

    for (const resource of resources) {
      for (const action of resource.actions) {
        lookup.set(buildPermissionCode(resource.code, action), resource);
      }
    }

    return lookup;
  }

  private buildOrganizationPermission(
    role: OrganizationRole,
    permissionCode: string,
    lookup: Map<string, Resource>,
  ): OrganizationPermission {
    const action = permissionCode.split(':')[1];
    const resource = lookup.get(permissionCode);

    if (!resource || !action) {
      throw new Error(`INVALID_PERMISSION_CODE:${permissionCode}`);
    }

    return this.permissionRepo.create({
      role,
      resource,
      action,
    });
  }

  private async loadRole(id: string, organizationId: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      this.roleRepo.findOne(
        { id, organization: { id: organizationId }, deletedAt: null },
        {
          populate: ['permissions.resource', 'assignments'],
        },
      ),
      'LOAD_FAILED',
    );
  }
}
