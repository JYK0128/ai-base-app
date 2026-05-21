import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ResourceType } from '@pkg/database';

import { CreateResourcesCommand } from './commands';
import { GetResourcesCommand } from './queries';

@Controller()
export class ResourceController {
  constructor(
    private readonly commandBus: CommandBus,
  ) { }

  @MessagePattern('resources.get')
  async getResources(
    @Payload() data: { permissions?: string[], roles?: string[] },
  ) {
    return this.commandBus.execute(new GetResourcesCommand(data.permissions, data.roles));
  }

  @MessagePattern('resources.create-batch')
  async createResources(
    @Payload() data: {
      items: Array<{
        tempId: string
        code: string
        name: string
        type: ResourceType
        path?: string
        icon?: string
        parentId?: string
        parentTempId?: string
        sortOrder?: number
      }>
    },
  ) {
    return this.commandBus.execute(new CreateResourcesCommand(data.items));
  }
}
