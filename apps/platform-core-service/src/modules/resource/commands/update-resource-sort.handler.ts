import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceRepository } from '@pkg/database';

import { UpdateResourceSortCommand } from './update-resource-sort.command';
import { UpdateResourceSortAsserter } from './update-resource-sort.error';

@CommandHandler(UpdateResourceSortCommand)
export class UpdateResourceSortHandler implements ICommandHandler<UpdateResourceSortCommand> {
  private readonly Asserter = UpdateResourceSortAsserter;

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: ResourceRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: UpdateResourceSortCommand): Promise<{ id: string }> {
    const resource = await this.identifyResource(command.id);
    this.processResourceModification(resource, command);
    return { id: resource.id };
  }

  private async identifyResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private processResourceModification(
    resource: Resource,
    command: UpdateResourceSortCommand,
  ): void {
    resource.sortOrder = command.sortOrder;
  }
}
