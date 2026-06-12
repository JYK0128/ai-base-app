import { EntityManager } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, Resource, ResourceScope } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetResourcesContract } from './get-resources.contract';
import { GetResourcesAsserter } from './get-resources.error';
import { ResourceResponseDto } from './get-resources.response.dto';

interface ResourceNodeSource {
  id: string
  code: string
  name: string
  type: Resource['type']
  scope: ResourceScope
  path?: string
  icon?: string
  sortOrder?: number
  actions: string[]
  constraint?: string
  parentId?: string
}

@QueryHandler(GetResourcesContract)
export class GetResourcesHandler implements IQueryHandler<GetResourcesContract> {
  private readonly Asserter = GetResourcesAsserter;

  constructor(
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetResourcesContract): Promise<ResourceResponseDto[]> {
    const resources = await this.identifyResources(query.data.scope);
    const tree = this.buildResourceTreeResponse(resources);

    if (query.data.filterByPermissions) {
      return this.filterAllowedResources(tree, query.data.permissions ?? []);
    }

    return tree;
  }

  private filterAllowedResources(
    nodes: ResourceResponseDto[],
    userPermissions: string[],
  ): ResourceResponseDto[] {
    return nodes
      .map((node) => {
        const filteredChildren = node.children.length > 0
          ? this.filterAllowedResources(node.children, userPermissions)
          : [];

        const requiredPermission = `${node.code}:READ`;
        const hasPermission = userPermissions.some((owned) => owned === requiredPermission);
        const hasReadAction = node.actions.includes('READ');

        if ((hasPermission && hasReadAction) || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }

        return null;
      })
      .filter((node): node is ResourceResponseDto => node !== null);
  }

  private async identifyResources(scope: ResourceScope): Promise<Resource[]> {
    const organizationId = this.cls.get('organizationId');
    const organization = organizationId
      ? await this.em.findOne(Organization, { id: organizationId })
      : null;

    const scopes = organization?.code === 'platform' && scope === ResourceScope.ORGANIZATION
      ? [ResourceScope.PLATFORM, ResourceScope.ORGANIZATION]
      : [scope];

    return await this.Asserter.assert(
      this.em.find(Resource, scopes.length === 1 ? { scope: scopes[0] } : { scope: { $in: scopes } }, {
        populate: ['parent'],
        orderBy: { sortOrder: 'ASC', code: 'ASC' },
      }),
      'LOAD_FAILED',
    );
  }

  private buildResourceTreeResponse(resources: Resource[]): ResourceResponseDto[] {
    const sources = resources.map((resource) => ({
      id: resource.id,
      code: resource.code,
      name: resource.name,
      type: resource.type,
      scope: resource.scope,
      path: resource.path,
      icon: resource.icon,
      sortOrder: resource.sortOrder,
      actions: resource.actions,
      constraint: resource.constraint,
      parentId: resource.parent?.id,
    }));

    return this.buildResourceTreeFromSources(sources);
  }

  private buildResourceTreeFromSources(resources: ResourceNodeSource[]): ResourceResponseDto[] {
    const map = new Map<string, ResourceResponseDto>();

    for (const resource of resources) {
      map.set(resource.id, new ResourceResponseDto(resource));
    }

    const roots: ResourceResponseDto[] = [];

    for (const resource of resources) {
      const node = map.get(resource.id);
      if (!node) continue;

      if (resource.parentId) {
        const parentNode = map.get(resource.parentId);
        if (parentNode) {
          parentNode.children.push(node);
          continue;
        }
      }

      roots.push(node);
    }

    this.sortResourceNodes(roots);
    return roots;
  }

  private sortResourceNodes(nodes: ResourceResponseDto[]) {
    nodes.sort((left, right) => {
      if (left.sortOrder === undefined && right.sortOrder === undefined) {
        return left.code.localeCompare(right.code);
      }
      if (left.sortOrder === undefined) {
        return 1;
      }
      if (right.sortOrder === undefined) {
        return -1;
      }

      const orderDiff = left.sortOrder - right.sortOrder;
      if (orderDiff !== 0) {
        return orderDiff;
      }

      return left.code.localeCompare(right.code);
    });

    for (const node of nodes) {
      if (node.children.length > 0) {
        this.sortResourceNodes(node.children);
      }
    }
  }
}
