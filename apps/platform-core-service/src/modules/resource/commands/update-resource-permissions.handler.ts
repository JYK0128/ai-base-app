import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceRepository, ResourceType } from '@pkg/database';

import { UpdateResourcePermissionsCommand } from './update-resource-permissions.command';
import { UpdateResourcePermissionsAsserter } from './update-resource-permissions.error';

@CommandHandler(UpdateResourcePermissionsCommand)
export class UpdateResourcePermissionsHandler implements ICommandHandler<UpdateResourcePermissionsCommand> {
  private readonly Asserter = UpdateResourcePermissionsAsserter;

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: ResourceRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: UpdateResourcePermissionsCommand): Promise<{ id: string }> {
    const resource = await this.identifyResource(command.id);
    await this.processResourceModification(resource, command);
    return { id: resource.id };
  }

  private async identifyResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private async processResourceModification(
    resource: Resource,
    command: UpdateResourcePermissionsCommand,
  ): Promise<void> {
    if (resource.type === ResourceType.MENU) {
      const children = await this.resourceRepo.find({ parent: resource });
      const newActions = command.actions || [];

      for (const child of children) {
        if (child.type === ResourceType.COMPONENT && child.constraint) {
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
