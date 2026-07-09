import { Transactional } from '@mikro-orm/decorators/legacy';
import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceAction, ResourceScope, ResourceType } from '@pkg/database';

import { UpdateResourceContract } from './update-resource.contract';
import { UpdateResourceAsserter } from './update-resource.error';
import { UpdateResourceResponseDto } from './update-resource.response.dto';

@CommandHandler(UpdateResourceContract)
export class UpdateResourceHandler implements ICommandHandler<UpdateResourceContract> {
  private readonly Asserter = UpdateResourceAsserter;

  @Transactional()
  async execute(command: UpdateResourceContract): Promise<UpdateResourceResponseDto> {
    const resource = await this.identifyResource(command.data.id);
    const code = command.data.code?.trim().toUpperCase();
    const parent = await this.identifyParent(command.data.parent);
    const nextType = command.data.type ?? resource.type;
    const nextScope = command.data.scope ?? resource.scope;

    await this.verifyUpdate(resource, code, parent, nextScope);
    const lockedActions = nextType === ResourceType.MENU
      ? await this.identifyLockedMenuActions(resource.id)
      : [];
    this.processUpdate(resource, command, code, parent, lockedActions);

    return new UpdateResourceResponseDto(resource.id);
  }

  private async identifyResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      Resource.findOne({ id }),
      'RESOURCE_NOT_FOUND',
    );
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

  private async verifyUpdate(
    resource: Resource,
    code: string | undefined,
    parent: Resource | undefined,
    scope: ResourceScope,
  ): Promise<void> {
    await this.verifyCode(resource, code);

    if (parent && parent.scope !== scope) {
      await this.Asserter.throw('PARENT_RESOURCE_SCOPE_MISMATCH');
    }
  }

  private async verifyCode(resource: Resource, code: string | undefined): Promise<void> {
    if (code === undefined) {
      return;
    }

    const existingResource = await Resource.findOne({
      code,
      id: { $ne: resource.id },
    });

    if (existingResource) {
      await this.Asserter.throw('RESOURCE_ALREADY_EXISTS');
    }
  }

  private processUpdate(
    resource: Resource,
    command: UpdateResourceContract,
    code: string | undefined,
    parent: Resource | undefined,
    lockedActions: ResourceAction[],
  ): void {
    if (code !== undefined) {
      resource.code = code;
    }
    if (command.data.name !== undefined) {
      resource.name = command.data.name.trim();
    }
    if (command.data.type !== undefined) {
      resource.type = command.data.type;
    }
    if (command.data.scope !== undefined) {
      resource.scope = command.data.scope;
    }
    if (command.data.parent !== undefined) {
      resource.parent = parent ?? null;
    }
    if (command.data.path !== undefined) {
      resource.path = command.data.path?.trim() || null;
    }
    if (command.data.icon !== undefined) {
      resource.icon = command.data.icon?.trim() || null;
    }
    if (command.data.sortOrder !== undefined) {
      resource.sortOrder = command.data.sortOrder;
    }

    this.applyActions(resource, command.data.actions, lockedActions);
  }

  private async identifyLockedMenuActions(resourceId: string): Promise<ResourceAction[]> {
    const resources = await Resource.find(
      {},
      {
        populate: ['parent'],
      },
    );
    const descendants = this.collectDescendants(resourceId, resources);
    const lockedActions = new Set<ResourceAction>();

    for (const item of descendants) {
      if (item.type !== ResourceType.COMPONENT) {
        continue;
      }

      if (item.creatable) {
        lockedActions.add(ResourceAction.CREATE);
      }
      if (item.readable) {
        lockedActions.add(ResourceAction.READ);
      }
      if (item.updatable) {
        lockedActions.add(ResourceAction.UPDATE);
      }
      if (item.deletable) {
        lockedActions.add(ResourceAction.DELETE);
      }
    }

    return [...lockedActions];
  }

  private collectDescendants(resourceId: string, resources: Resource[]): Resource[] {
    const descendants: Resource[] = [];
    const children = resources.filter((item) => item.parent?.id === resourceId);

    for (const child of children) {
      descendants.push(child);
      descendants.push(...this.collectDescendants(child.id, resources));
    }

    return descendants;
  }

  private applyActions(resource: Resource, actions: ResourceAction[] | undefined, lockedActions: ResourceAction[]): void {
    if (resource.type === ResourceType.COMPONENT) {
      resource.set(actions?.[0] ?? ResourceAction.READ);
      return;
    }

    const nextActions = actions && actions.length > 0
      ? actions
      : [ResourceAction.CREATE, ResourceAction.READ, ResourceAction.UPDATE, ResourceAction.DELETE];
    const nextLockedActions = lockedActions.filter((action) => !nextActions.includes(action));

    if (nextActions.length === 0 && nextLockedActions.length === 0) {
      throw new BadRequestException('INVALID_RESOURCE_ACTIONS');
    }

    resource.revoke(ResourceAction.CREATE, ResourceAction.READ, ResourceAction.UPDATE, ResourceAction.DELETE);
    resource.grant(...nextActions, ...nextLockedActions);
  }
}
