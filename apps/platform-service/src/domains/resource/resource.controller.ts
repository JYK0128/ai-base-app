import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetPermissionSetsContract } from './get-permission-sets/get-permission-sets.contract';
import { GetPermissionSetResponseDto } from './get-permission-sets/get-permission-sets.response.dto';
import { GetResourceContract } from './get-resource/get-resource.contract';
import { GetResourceResponseDto } from './get-resource/get-resource.response.dto';
import { GetResourcePageContract } from './get-resource-page/get-resource-page.contract';
import { GetResourcePageRequestDto } from './get-resource-page/get-resource-page.request.dto';
import { GetResourceResponseDto as GetResourcePageItemResponseDto } from './get-resource-page/get-resource-page.response.dto';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('permission-sets')
  async getPermissionSets(): Promise<GetPermissionSetResponseDto[]> {
    return this.queryBus.execute(new GetPermissionSetsContract());
  }

  @Get(':id')
  async getResource(
    @Param('id') id: string,
  ): Promise<GetResourceResponseDto> {
    return this.queryBus.execute(new GetResourceContract({ id }));
  }

  @Get()
  async getResourcePage(
    @Query() query: GetResourcePageRequestDto,
  ): Promise<GetResourcePageItemResponseDto[]> {
    return this.queryBus.execute(new GetResourcePageContract(query));
  }
}
    const resources = await this.em.find(Resource, scopes.length === 1 ? { scope: scopes[0] } : { scope: { $in: scopes } }, {
      populate: ['parent'],
      orderBy: { sortOrder: 'ASC', code: 'ASC' },
    });

    return this.buildResourceTreeResponse(resources);
  }

  @Get('my')
  @ApiOperation({
    summary: '내 리소스 목록 조회',
    description: '내 허용 리소스를 조회합니다.',
    operationId: 'ResourceController_getMyResources_v1',
  })
  @ApiOkResponse({ type: [ResourceResponseDto] })
  async getMyResources(): Promise<ResourceResponseDto[]> {
    const resources = await this.em.find(Resource, { scope: ResourceScope.ORGANIZATION }, {
      populate: ['parent'],
      orderBy: { sortOrder: 'ASC', code: 'ASC' },
    });
    return this.buildResourceTreeResponse(resources);
  }

  @Get('permission-sets')
  @ApiOperation({
    summary: '권한 세트 목록 조회',
    description: '조직의 권한 세트 목록을 조회합니다.',
    operationId: 'ResourceController_getPermissionSets_v1',
  })
  @ApiOkResponse({ type: [PermissionSetResponseDto] })
  async getPermissionSets(): Promise<PermissionSetResponseDto[]> {
    const organizationId = this.cls.get('organizationId');
    if (!organizationId) {
      throw new NotFoundException('ORGANIZATION_NOT_FOUND');
    }

    const roles = await this.em.find(OrganizationRole, 
      { organization: { id: organizationId }, deletedAt: null },
      { populate: ['permissions.resource', 'assignments'] }
    );

    return roles.map(role => this.mapPermissionSet(role));
  }

  @Post('permission-sets')
  @ApiOperation({
    summary: '권한 세트 생성',
    description: '조직의 권한 세트를 생성합니다.',
    operationId: 'ResourceController_createPermissionSet_v1',
  })
  @ApiOkResponse({ type: PermissionSetResponseDto })
  async createPermissionSet(
    @Body() dto: CreatePermissionSetDto,
  ): Promise<PermissionSetResponseDto> {
    const organizationId = this.cls.get('organizationId');
    if (!organizationId) {
      throw new NotFoundException('ORGANIZATION_NOT_FOUND');
    }

    const organization = await this.em.findOneOrFail(Organization, { id: organizationId });
    const normalizedCode = dto.code.toUpperCase().replace(/\s+/g, '_');

    const existingRole = await this.em.findOne(OrganizationRole, { organization, code: normalizedCode, deletedAt: null });
    if (existingRole) {
      throw new ConflictException('ROLE_CODE_ALREADY_EXISTS');
    }

    let copiedPermissionCodes: string[] = [];
    if (dto.copyFromId) {
      const sourceRole = await this.em.findOne(
        OrganizationRole,
        { id: dto.copyFromId, organization, deletedAt: null },
        { populate: ['permissions.resource'] }
      );
      if (sourceRole) {
        copiedPermissionCodes = sourceRole.permissions.getItems().map(p => `${p.resource.code}:${p.action}`);
      }
    }

    const role = this.em.create(OrganizationRole, {
      organization,
      code: normalizedCode,
      name: dto.name,
      description: dto.description,
    });
    this.em.persist(role);

    const resources = await this.em.find(Resource, {});
    const resourceMap = new Map<string, Resource>();
    for (const r of resources) {
      resourceMap.set(r.code, r);
    }

    for (const code of copiedPermissionCodes) {
      const [resCode, action] = code.split(':');
      const resource = resourceMap.get(resCode);
      if (resource && action) {
        const permission = this.em.create(OrganizationPermission, {
          role,
          resource,
          action,
        });
        this.em.persist(permission);
      }
    }

    await this.em.flush();
    await this.em.populate(role, ['permissions.resource', 'assignments']);
    return this.mapPermissionSet(role);
  }

  @Post('permission-sets/update-permissions')
  @ApiOperation({
    summary: '권한 세트 퍼미션 수정',
    description: '권한 세트의 퍼미션을 수정합니다.',
    operationId: 'ResourceController_updatePermissionSetPermissions_v1',
  })
  @ApiOkResponse({ type: PermissionSetResponseDto })
  async updatePermissionSetPermissions(
    @Body() dto: UpdatePermissionSetPermissionsDto,
  ): Promise<PermissionSetResponseDto> {
    const organizationId = this.cls.get('organizationId');
    if (!organizationId) {
      throw new NotFoundException('ORGANIZATION_NOT_FOUND');
    }

    const role = await this.em.findOneOrFail(
      OrganizationRole,
      { id: dto.id, organization: { id: organizationId }, deletedAt: null },
      { populate: ['permissions'] }
    );

    for (const perm of role.permissions) {
      this.em.remove(perm);
    }
    role.permissions.clear();

    const resources = await this.em.find(Resource, {});
    const resourceMap = new Map<string, Resource>();
    for (const r of resources) {
      resourceMap.set(r.code, r);
    }

    for (const code of dto.permissionCodes) {
      const [resCode, action] = code.split(':');
      const resource = resourceMap.get(resCode);
      if (resource && action) {
        const permission = this.em.create(OrganizationPermission, {
          role,
          resource,
          action,
        });
        this.em.persist(permission);
        role.permissions.add(permission);
      }
    }

    await this.em.flush();
    await this.em.populate(role, ['permissions.resource', 'assignments']);
    return this.mapPermissionSet(role);
  }

  @Get(':id')
  @ApiOperation({
    summary: '리소스 조회',
    description: '리소스 상세를 조회합니다.',
    operationId: 'ResourceController_getResource_v1',
  })
  @ApiOkResponse({ type: ResourceDetailResponseDto })
  async getResource(
    @Param('id') id: string,
  ): Promise<ResourceDetailResponseDto> {
    const resource = await this.em.findOneOrFail(Resource, { id }, { populate: ['parent'] });
    return {
      id: resource.id,
      code: resource.code,
      name: resource.name,
      type: resource.type,
      scope: resource.scope,
      path: resource.path,
      icon: resource.icon,
      sortOrder: resource.sortOrder,
      actions: resource.actions ?? [],
      parentId: resource.parent?.id,
    };
  }

  @Post('create')
  @ApiOperation({
    summary: '리소스 생성',
    description: '리소스를 생성합니다.',
    operationId: 'ResourceController_createResource_v1',
  })
  @ApiOkResponse({ type: ResourceResponseDto })
  async createResource(
    @Body() dto: CreateResourceDto,
  ): Promise<ResourceResponseDto> {
    const existing = await this.em.findOne(Resource, { code: dto.code });
    if (existing) {
      throw new ConflictException('RESOURCE_ALREADY_EXISTS');
    }

    let parent: Resource | undefined;
    if (dto.parentId) {
      parent = await this.em.findOneOrFail(Resource, { id: dto.parentId });
    }

    const resource = this.em.create(Resource, {
      code: dto.code,
      name: dto.name,
      type: dto.type,
      scope: ResourceScope.ORGANIZATION,
      path: dto.path,
      parent,
    });
    this.em.persist(resource);
    await this.em.flush();

    return {
      id: resource.id,
      code: resource.code,
      name: resource.name,
      type: resource.type,
      scope: resource.scope,
      path: resource.path,
      icon: resource.icon,
      sortOrder: resource.sortOrder,
      actions: resource.actions ?? [],
      children: [],
    };
  }

  @Post('update')
  @ApiOperation({
    summary: '리소스 수정',
    description: '리소스를 수정합니다.',
    operationId: 'ResourceController_updateResource_v1',
  })
  @ApiOkResponse({ type: ResourceResponseDto })
  async updateResource(
    @Body() dto: UpdateResourceDetailBodyDto,
  ): Promise<ResourceResponseDto> {
    const resource = await this.em.findOneOrFail(Resource, { id: dto.id }, { populate: ['parent', 'children'] });
    resource.code = dto.code;
    resource.name = dto.name;
    resource.scope = dto.scope;
    resource.path = dto.path;
    resource.icon = dto.icon;

    await this.em.flush();

    return {
      id: resource.id,
      code: resource.code,
      name: resource.name,
      type: resource.type,
      scope: resource.scope,
      path: resource.path,
      icon: resource.icon,
      sortOrder: resource.sortOrder,
      actions: resource.actions ?? [],
      children: [],
    };
  }

  @Post('update-permissions')
  @ApiOperation({
    summary: '리소스 권한 수정',
    description: '리소스 권한을 수정합니다.',
    operationId: 'ResourceController_updateResourcePermissions_v1',
  })
  @ApiOkResponse({ type: ResourceResponseDto })
  async updateResourcePermissions(
    @Body() dto: UpdateResourcePermissionsDto,
  ): Promise<ResourceResponseDto> {
    const resource = await this.em.findOneOrFail(Resource, { id: dto.id });

    if (resource.isMenu) {
      const children = await this.em.find(Resource, { parent: resource });
      for (const child of children) {
        if (child.isComponent && child.constraint) {
          if (!dto.actions.includes(child.constraint)) {
            throw new BadRequestException('CANNOT_REMOVE_ACTIVE_CONSTRAINT');
          }
        }
      }

      if (!resource.metadata) {
        resource.metadata = new ResourceMetadata();
      }
      resource.metadata.creatable = dto.actions.includes('CREATE');
      resource.metadata.readable = dto.actions.includes('READ');
      resource.metadata.updatable = dto.actions.includes('UPDATE');
      resource.metadata.deletable = dto.actions.includes('DELETE');
    } else {
      const action = dto.actions[0] || null;
      resource.set(action as ResourceAction);
    }

    await this.em.flush();

    return {
      id: resource.id,
      code: resource.code,
      name: resource.name,
      type: resource.type,
      scope: resource.scope,
      path: resource.path,
      icon: resource.icon,
      sortOrder: resource.sortOrder,
      actions: resource.actions ?? [],
      children: [],
    };
  }

  @Post('update-sort')
  @ApiOperation({
    summary: '리소스 정렬 순서 수정',
    description: '리소스 정렬 순서를 수정합니다.',
    operationId: 'ResourceController_updateResourceSort_v1',
  })
  async updateResourceSort(
    @Body() dto: UpdateResourceSortDto,
  ): Promise<void> {
    for (const item of dto.items) {
      const resource = await this.em.findOne(Resource, { id: item.id });
      if (resource) {
        resource.sortOrder = item.sortOrder;
      }
    }
    await this.em.flush();
  }

  @Post('delete')
  @ApiOperation({
    summary: '리소스 삭제',
    description: '리소스를 삭제합니다.',
    operationId: 'ResourceController_deleteResource_v1',
  })
  @ApiOkResponse({ type: DeleteResourceResponseDto })
  async deleteResource(
    @Body() dto: DeleteResourceBodyDto,
  ): Promise<DeleteResourceResponseDto> {
    const resource = await this.em.findOneOrFail(Resource, { id: dto.id });
    this.em.remove(resource);
    await this.em.flush();
    return { id: dto.id };
  }

  private buildResourceTreeResponse(resources: Resource[]): ResourceResponseDto[] {
    const map = new Map<string, ResourceResponseDto>();

    for (const resource of resources) {
      map.set(resource.id, {
        id: resource.id,
        code: resource.code,
        name: resource.name,
        type: resource.type,
        scope: resource.scope,
        path: resource.path,
        icon: resource.icon,
        sortOrder: resource.sortOrder,
        actions: resource.actions ?? [],
        children: [],
      });
    }

    const roots: ResourceResponseDto[] = [];

    for (const resource of resources) {
      const node = map.get(resource.id);
      if (!node) continue;

      if (resource.parent?.id) {
        const parentNode = map.get(resource.parent.id);
        if (parentNode) {
          parentNode.children.push(node);
          continue;
        }
      }

      roots.push(node);
    }

    this.sortResourceNodes(roots);
    return roots;
  }

  private sortResourceNodes(nodes: ResourceResponseDto[]) {
    nodes.sort((left, right) => {
      if (left.sortOrder === undefined && right.sortOrder === undefined) {
        return left.code.localeCompare(right.code);
      }
      if (left.sortOrder === undefined) {
        return 1;
      }
      if (right.sortOrder === undefined) {
        return -1;
      }

      const orderDiff = left.sortOrder - right.sortOrder;
      if (orderDiff !== 0) {
        return orderDiff;
      }

      return left.code.localeCompare(right.code);
    });

    for (const node of nodes) {
      if (node.children.length > 0) {
        this.sortResourceNodes(node.children);
      }
    }
  }

  private mapPermissionSet(role: OrganizationRole): PermissionSetResponseDto {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description ?? undefined,
      assignmentCount: role.assignments.count(),
      permissionCodes: Array.from(
        new Set(
          role.permissions.getItems().map(p => `${p.resource.code}:${p.action}`)
        )
      ).sort((a, b) => a.localeCompare(b)),
    };
  }
}
