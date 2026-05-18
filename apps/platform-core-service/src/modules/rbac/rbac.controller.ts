import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';

import { GetResourcesCommand } from './queries';

@Controller()
export class RbacController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern('rbac.resources.get')
  async getResources() {
    return this.commandBus.execute(new GetResourcesCommand());
  }
}
