import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Organization, OrganizationPermission, OrganizationPermissionRepository, OrganizationRepository, OrganizationRole, OrganizationRoleRepository, Resource, ResourceRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildPermissionCode, buildPermissionSetRecord, normalizePermissionCodes } from '../permission-sets.helpers';
import { UpdatePermissionSetPermissionsCommand } from './update-permission-set-permissions.command';
import { UpdatePermissionSetPermissionsAsserter } from './update-permission-set-permissions.error';

@CommandHandler(UpdatePermissionSetPermissionsCommand)
export class UpdatePermissionSetPermissionsHandler implements ICommandHandler<UpdatePermissionSetPermissionsCommand> {
  private readonly Asserter = UpdatePermissionSetPermissionsAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(OrganizationRole)
    private readonly roleRepo: OrganizationRoleRepository,
    @InjectRepository(Resource)
    private readonly resourceRepo: ResourceRepository,
    @InjectRepository(OrganizationPermission)
    private readonly permissionRepo: OrganizationPermissionRepository,
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: UpdatePermissionSetPermissionsCommand) {
    const organization = await this.identifyOrganization();
    const role = await this.identifyRole(command.id, organization.id);
    const availablePermissionLookup = await this.buildAvailablePermissionLookup();
    const permissionCodes = normalizePermissionCodes(command.permissionCodes);

    for (const permissionCode of permissionCodes) {
      await this.Asserter.throwIf(!availablePermissionLookup.has(permissionCode), 'INVALID_PERMISSION_CODE');
    }

    await this.em.nativeDelete(OrganizationPermission, { role });

    for (const permissionCode of permissionCodes) {
      this.em.persist(this.buildOrganizationPermission(role, permissionCode, availablePermissionLookup));
    }

    await this.em.flush();

    const updatedRole = await this.loadRole(role.id, organization.id);
    return buildPermissionSetRecord(updatedRole);
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

  private async identifyRole(id: string, organizationId: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      this.roleRepo.findOne(
        { id, organization: { id: organizationId }, deletedAt: null },
        { populate: ['permissions.resource', 'assignments'] },
      ),
      'ROLE_NOT_FOUND',
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
      'ROLE_NOT_FOUND',
    );
  }
}
