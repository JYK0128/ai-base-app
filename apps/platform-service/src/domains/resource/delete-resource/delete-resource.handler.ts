import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { DeleteResourceContract } from './delete-resource.contract';
import { DeleteResourceAsserter } from './delete-resource.error';
import { DeleteResourceResponseDto } from './delete-resource.response.dto';

@CommandHandler(DeleteResourceContract)
export class DeleteResourceHandler implements ICommandHandler<DeleteResourceContract> {
  private readonly Asserter = DeleteResourceAsserter;

  @Transactional()
  async execute(command: DeleteResourceContract): Promise<DeleteResourceResponseDto> {
    const resource = await this.identifyResource(command.data.id);
    await this.processDelete(resource);

    return new DeleteResourceResponseDto(resource.id);
  }

  private async identifyResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      Resource.findOne({ id }, { populate: ['children'] }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private async processDelete(resource: Resource): Promise<void> {
    const children = await Resource.find({ parent: resource.id });

    for (const child of children) {
      await this.processDelete(child);
    }

    resource.remove();
  }
}
