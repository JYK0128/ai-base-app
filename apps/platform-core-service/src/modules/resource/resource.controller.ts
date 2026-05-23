import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { ResourceType } from '@pkg/database';

import { CreateResourceCommand, DeleteResourceCommand, UpdateResourceDetailCommand, UpdateResourcePermissionsCommand, UpdateResourceSortCommand } from './commands';
import { GetResourceQuery, GetResourcesQuery } from './queries';
import { RESOURCE_SERVICE_PATTERNS } from './resource.constants';

@Controller()
export class ResourceController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.GET)
  async getResource(
    @Payload() data: { id: string },
  ) {
    return this.queryBus.execute(new GetResourceQuery(data.id));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.LIST)
  async getResources(
    @Payload() data: { permissions?: string[], roles?: string[] },
  ) {
    return this.queryBus.execute(new GetResourcesQuery(data.permissions, data.roles));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.CREATE)
  async createResource(
    @Payload() data: {
      code: string
      name: string
      type: ResourceType
      path?: string
      icon?: string
      parentId?: string
      sortOrder?: number
    },
  ) {
    return this.commandBus.execute(new CreateResourceCommand(
      data.code,
      data.name,
      data.type,
      data.path,
      data.icon,
      data.parentId,
      data.sortOrder,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_DETAIL)
  async updateResource(
    @Payload() data: {
      id: string
      code: string
      name: string
      path?: string
      icon?: string
    },
  ) {
    return this.commandBus.execute(new UpdateResourceDetailCommand(
      data.id,
      data.code,
      data.name,
      data.path,
      data.icon,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_PERMISSIONS)
  async updateResourcePermissions(
    @Payload() data: {
      id: string
      actions: string[]
      constraint?: string
    },
  ) {
    return this.commandBus.execute(new UpdateResourcePermissionsCommand(
      data.id,
      data.actions,
      data.constraint,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_SORT)
  async updateResourceSort(
    @Payload() data: {
      id: string
      sortOrder: number
    },
  ) {
    return this.commandBus.execute(new UpdateResourceSortCommand(
      data.id,
      data.sortOrder,
    ));
  }

  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.DELETE)
  async deleteResource(
    @Payload() data: { id: string },
  ) {
    return this.commandBus.execute(new DeleteResourceCommand(data.id));
  }
}
