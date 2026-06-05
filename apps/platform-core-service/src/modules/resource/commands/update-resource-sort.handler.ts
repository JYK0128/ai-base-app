import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
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
  ) {}

  @Transactional()
  async execute(command: UpdateResourceSortCommand): Promise<{ success: boolean }> {
    for (const item of command.items) {
      const resource = await this.identifyResource(item.id);
      resource.sortOrder = item.sortOrder;
    }
    return { success: true };
  }

  private async identifyResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id }),
      'RESOURCE_NOT_FOUND',
    );
  }
}
