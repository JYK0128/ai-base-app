import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceRepository } from '@pkg/database';

import { UpdateResourceDetailCommand } from './update-resource-detail.command';
import { UpdateResourceDetailAsserter } from './update-resource-detail.error';

@CommandHandler(UpdateResourceDetailCommand)
export class UpdateResourceDetailHandler implements ICommandHandler<UpdateResourceDetailCommand> {
  private readonly Asserter = UpdateResourceDetailAsserter;

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: ResourceRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: UpdateResourceDetailCommand): Promise<{ id: string }> {
    const resource = await this.identifyResource(command.id);
    await this.validateNoDuplicateCode(command.code, resource.id);

    this.processResourceModification(resource, command);
    return { id: resource.id };
  }

  private async identifyResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private async validateNoDuplicateCode(code: string, currentId: string): Promise<void> {
    const existing = await this.resourceRepo.findOne({ code });
    if (existing && existing.id !== currentId) {
      return this.Asserter.throw('ALREADY_EXISTS');
    }
  }

  private processResourceModification(
    resource: Resource,
    command: UpdateResourceDetailCommand,
  ): void {
    resource.code = command.code;
    resource.name = command.name;
    resource.path = command.path;
    resource.icon = command.icon;
  }
}
