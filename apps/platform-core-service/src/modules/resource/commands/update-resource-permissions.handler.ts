import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, Resource } from '@pkg/database';

import { UpdateResourcePermissionsCommand } from './update-resource-permissions.command';
import { UpdateResourcePermissionsAsserter } from './update-resource-permissions.error';

@CommandHandler(UpdateResourcePermissionsCommand)
export class UpdateResourcePermissionsHandler implements ICommandHandler<UpdateResourcePermissionsCommand> {
  private readonly Asserter = UpdateResourcePermissionsAsserter;

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: CoreRepository<Resource>,
  ) {}

  @Transactional()
  async execute(command: UpdateResourcePermissionsCommand): Promise<{ id: string }> {
    const resource = await this.identifyResource(command.id);
    await this.processResourceModification(resource, command);
    return { id: resource.id };
  }

  private async identifyResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id }, { populate: ['parent', 'children'] }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private async processResourceModification(
    resource: Resource,
    command: UpdateResourcePermissionsCommand,
  ): Promise<void> {
    if (resource.isMenu) {
      const children: Resource[] = await this.resourceRepo.find(
        {
          parent: resource,
        },
        { populate: ['children'] },
      );
      const newActions = command.actions;

      for (const child of children) {
        if (child.isComponent && child.constraint) {
          await this.Asserter.throwIf(
            !newActions.includes(child.constraint),
            'CANNOT_REMOVE_ACTIVE_CONSTRAINT',
          );
        }
      }
    }

    resource.actions = command.actions;
    resource.constraint = command.constraint;
  }
}
