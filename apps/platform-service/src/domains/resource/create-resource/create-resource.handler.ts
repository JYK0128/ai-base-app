import { Transactional } from '@mikro-orm/decorators/legacy';
import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceAction, ResourceScope, ResourceType } from '@pkg/database';

import { CreateResourceContract } from './create-resource.contract';
import { CreateResourceAsserter } from './create-resource.error';
import { CreateResourceResponseDto } from './create-resource.response.dto';

@CommandHandler(CreateResourceContract)
export class CreateResourceHandler implements ICommandHandler<CreateResourceContract> {
  private readonly Asserter = CreateResourceAsserter;

  @Transactional()
  async execute(command: CreateResourceContract): Promise<CreateResourceResponseDto> {
    const code = command.data.code.trim().toUpperCase();
    const name = command.data.name.trim();
    const parent = await this.identifyParent(command.data.parent);
    const scope = command.data.scope ?? ResourceScope.PLATFORM;

    await this.verifyCreation(code, parent, scope);
    const resource = this.processCreation(command, code, name, parent, scope);

    return new CreateResourceResponseDto(resource.id);
  }

  private async identifyParent(parentId?: string | null): Promise<Resource | undefined> {
    if (!parentId) {
      return undefined;
    }

    return await this.Asserter.assert(
      Resource.findOne({ id: parentId }, { populate: ['parent'] }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private async verifyCreation(code: string, parent: Resource | undefined, scope: ResourceScope): Promise<void> {
    const existingResource = await Resource.findOne({ code });
    if (existingResource) {
      await this.Asserter.throw('RESOURCE_ALREADY_EXISTS');
    }

    if (parent && parent.scope !== scope) {
      await this.Asserter.throw('PARENT_RESOURCE_SCOPE_MISMATCH');
    }
  }

  private processCreation(
    command: CreateResourceContract,
    code: string,
    name: string,
    parent: Resource | undefined,
    scope: ResourceScope,
  ): Resource {
    const resource = Resource.create({
      code,
      name,
      type: command.data.type,
      scope,
      parent: parent ?? null,
      path: command.data.path?.trim() ?? null,
      icon: command.data.icon?.trim() ?? null,
      sortOrder: command.data.sortOrder ?? null,
    });

    this.applyActions(resource, command.data.actions);
    return resource;
  }

  private applyActions(resource: Resource, actions: ResourceAction[] | undefined): void {
    if (resource.type === ResourceType.COMPONENT) {
      resource.set(actions?.[0] ?? ResourceAction.READ);
      return;
    }

    const nextActions = actions && actions.length > 0
      ? actions
      : [ResourceAction.CREATE, ResourceAction.READ, ResourceAction.UPDATE, ResourceAction.DELETE];

    if (nextActions.length === 0) {
      throw new BadRequestException('INVALID_RESOURCE_ACTIONS');
    }

    resource.grant(...nextActions);
  }
}
