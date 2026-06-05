import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceRepository } from '@pkg/database';

import { DeleteResourceCommand } from './delete-resource.command';
import { DeleteResourceAsserter } from './delete-resource.error';

@CommandHandler(DeleteResourceCommand)
export class DeleteResourceHandler implements ICommandHandler<DeleteResourceCommand> {
  private readonly Asserter = DeleteResourceAsserter;

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: ResourceRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: DeleteResourceCommand): Promise<{ id: string }> {
    const resource = await this.assertResource(command.id);
    await this.softDeleteTree(resource);
    return { id: resource.id };
  }

  private async assertResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private async softDeleteTree(resource: Resource): Promise<void> {
    await this.em.populate(resource, ['children']);

    const children = resource.children.getItems();
    if (children.length > 0) {
      await Promise.all(children.map((child) => this.softDeleteTree(child)));
    }

    resource.remove();
  }
}
