import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { UpdateResourceSortContract } from './update-resource-sort.contract';
import { UpdateResourceSortAsserter } from './update-resource-sort.error';
import { UpdateResourceSortResponseDto } from './update-resource-sort.response.dto';

@CommandHandler(UpdateResourceSortContract)
export class UpdateResourceSortHandler implements ICommandHandler<UpdateResourceSortContract> {
  private readonly Asserter = UpdateResourceSortAsserter;

  @Transactional()
  async execute(command: UpdateResourceSortContract): Promise<UpdateResourceSortResponseDto> {
    await this.processSort(command);
    return new UpdateResourceSortResponseDto(command.data.items.map((item) => item.id));
  }

  private async processSort(command: UpdateResourceSortContract): Promise<void> {
    for (const item of command.data.items) {
      const resource = await this.Asserter.assert(
        Resource.findOne({ id: item.id }),
        'RESOURCE_NOT_FOUND',
      );

      resource.sortOrder = item.sortOrder;
      resource.parent = item.parent ? Resource.getReference(item.parent) : null;
    }
  }
}
