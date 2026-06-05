import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceRepository, ResourceScope } from '@pkg/database';

import { UpdateResourceDetailCommand } from './update-resource-detail.command';
import { UpdateResourceDetailAsserter } from './update-resource-detail.error';

@CommandHandler(UpdateResourceDetailCommand)
export class UpdateResourceDetailHandler implements ICommandHandler<UpdateResourceDetailCommand> {
  private readonly Asserter = UpdateResourceDetailAsserter;

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: ResourceRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateResourceDetailCommand): Promise<{ id: string }> {
    const resource = await this.identifyResource(command.id, command.scope);
    await this.validateNoDuplicateCode(command.code, resource.id);
    await this.processResourceModification(resource, command);
    return { id: resource.id };
  }

  private async identifyResource(id: string, scope: ResourceScope): Promise<Resource> {
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id, scope }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private async validateNoDuplicateCode(code: string, currentId: string): Promise<void> {
    const existing = await this.resourceRepo.findOne({ code });
    if (existing && existing.id !== currentId) {
      return this.Asserter.throw('ALREADY_EXISTS');
    }
  }

  private async processResourceModification(
    resource: Resource,
    command: UpdateResourceDetailCommand,
  ): Promise<void> {
    const nextPath = command.path?.trim();
    const nextIcon = command.icon?.trim();

    resource.code = command.code;
    resource.name = command.name;
    resource.path = nextPath;
    resource.icon = nextIcon;
  }
}
