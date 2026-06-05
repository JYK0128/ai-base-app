import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { ResourceScope, ResourceType } from '@pkg/database';

import { CreatePermissionSetCommand,
         CreateResourceCommand,
         DeleteResourceCommand,
         UpdatePermissionSetPermissionsCommand,
         UpdateResourceDetailCommand,
         UpdateResourcePermissionsCommand,
         UpdateResourceSortCommand } from './commands';
import { GetPermissionSetsQuery, GetResourceQuery, GetResourcesQuery } from './queries';
import type { ResourceTreeNode } from './queries/get-resources.handler';
import { RESOURCE_SERVICE_PATTERNS } from './resource.constants';

@Controller()
export class ResourceController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.PERMISSION_SET.LIST)
  async getPermissionSets(
    @Payload() _data: object,
  ) {
    return this.queryBus.execute(new GetPermissionSetsQuery());
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.GET)
  async getResource(
    @Payload() data: { id: string },
  ): Promise<unknown> {
    return this.queryBus.execute(new GetResourceQuery(data.id));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.LIST)
  async getResources(
    @Payload() data: {
      permissions: string[]
      scope: ResourceScope
      filterByPermissions: boolean
    },
  ): Promise<ResourceTreeNode[]> {
    return this.queryBus.execute(new GetResourcesQuery(
      data.permissions,
      data.scope,
      data.filterByPermissions,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.CREATE)
  async createResource(
    @Payload() data: {
      code: string
      name: string
      type: ResourceType
      path?: string
      parentId?: string
    },
  ): Promise<unknown> {
    return this.commandBus.execute(new CreateResourceCommand(
      data.code,
      data.name,
      data.type,
      data.path,
      data.parentId,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.PERMISSION_SET.CREATE)
  async createPermissionSet(
    @Payload() data: {
      code: string
      name: string
      description?: string
      copyFromId?: string
    },
  ) {
    return this.commandBus.execute(new CreatePermissionSetCommand(
      data.code,
      data.name,
      data.description,
      data.copyFromId,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_DETAIL)
  async updateResource(
    @Payload() data: {
      id: string
      code: string
      name: string
      scope: ResourceScope
      path?: string
      icon?: string
    },
  ): Promise<unknown> {
    return this.commandBus.execute(new UpdateResourceDetailCommand(
      data.id,
      data.code,
      data.name,
      data.scope,
      data.path,
      data.icon,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_PERMISSIONS)
  async updateResourcePermissions(
    @Payload() data: {
      id: string
      scope: ResourceScope
      actions: string[]
      constraint?: string
    },
  ): Promise<unknown> {
    return this.commandBus.execute(new UpdateResourcePermissionsCommand(
      data.id,
      data.scope,
      data.actions,
      data.constraint,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.PERMISSION_SET.UPDATE_PERMISSIONS)
  async updatePermissionSetPermissions(
    @Payload() data: {
      id: string
      permissionCodes: string[]
    },
  ) {
    return this.commandBus.execute(new UpdatePermissionSetPermissionsCommand(
      data.id,
      data.permissionCodes,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_SORT)
  async updateResourceSort(
    @Payload() data: {
      scope: ResourceScope
      items: Array<{
        id: string
        sortOrder: number
      }>
    },
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(new UpdateResourceSortCommand(
      data.scope,
      data.items,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.DELETE)
  async deleteResource(
    @Payload() data: { id: string },
  ): Promise<unknown> {
    return this.commandBus.execute(new DeleteResourceCommand(data.id));
  }
}
