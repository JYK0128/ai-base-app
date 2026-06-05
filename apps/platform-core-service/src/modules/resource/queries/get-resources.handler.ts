import { EntityManager } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, Resource, ResourceScope } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetResourcesAsserter } from './get-resources.error';
import { GetResourcesQuery } from './get-resources.query';

export interface ResourceTreeNode {
  id: string
  code: string
  name: string
  type: string
  scope: ResourceScope
  path?: string
  icon?: string
  sortOrder?: number
  actions: string[]
  constraint?: string
  children: ResourceTreeNode[]
}

interface ResourceNodeSource {
  id: string
  code: string
  name: string
  type: string
  scope: ResourceScope
  path?: string
  icon?: string
  sortOrder?: number
  actions: string[]
  constraint?: string
  parentId?: string
}

/**
 * 플랫폼 리소스 트리 조회 핸들러
 */
@QueryHandler(GetResourcesQuery)
export class GetResourcesHandler implements IQueryHandler<GetResourcesQuery> {
  private readonly Asserter = GetResourcesAsserter;

  constructor(
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetResourcesQuery): Promise<ResourceTreeNode[]> {
    const resources = await this.identifyResources(query.scope);
    const tree = this.processResources(resources);

    if (query.filterByPermissions) {
      return this.filterAllowedResources(
        tree,
        query.permissions,
      );
    }

    return tree;
  }

  private filterAllowedResources(
    nodes: ResourceTreeNode[],
    userPermissions: string[],
  ): ResourceTreeNode[] {
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
      .filter((node): node is ResourceTreeNode => node !== null);
  }

  private async identifyResources(
    scope: ResourceScope,
  ): Promise<ResourceNodeSource[]> {
    const organizationId = this.cls.get('organizationId');
    const organization = organizationId
      ? await this.em.findOne(Organization, { id: organizationId })
      : null;

    const scopes = organization?.code === 'platform' && scope === ResourceScope.ORGANIZATION
      ? [ResourceScope.PLATFORM, ResourceScope.ORGANIZATION]
      : [scope];

    const resources: Resource[] = await this.Asserter.assert(
      this.em.find(Resource, scopes.length === 1 ? { scope: scopes[0] } : { scope: { $in: scopes } }, {
        populate: ['parent'],
        orderBy: { sortOrder: 'ASC', code: 'ASC' },
      }),
      'LOAD_FAILED',
    );

    return resources.map((resource) => ({
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
  }

  private processResources(resources: ResourceNodeSource[]): ResourceTreeNode[] {
    const map = new Map<string, ResourceTreeNode>();

    for (const res of resources) {
      map.set(res.id, {
        id: res.id,
        code: res.code,
        name: res.name,
        type: res.type,
        scope: res.scope,
        path: res.path,
        icon: res.icon,
        sortOrder: res.sortOrder,
        actions: res.actions,
        constraint: res.constraint,
        children: [],
      });
    }

    const roots: ResourceTreeNode[] = [];

    for (const res of resources) {
      const node = map.get(res.id);
      if (!node) continue;

      if (res.parentId) {
        const parentNode = map.get(res.parentId);
        if (parentNode) {
          parentNode.children.push(node);
          continue;
        }
      }

      roots.push(node);
    }

    const sortNodes = (nodes: ResourceTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.sortOrder === undefined && b.sortOrder === undefined) {
          return a.code.localeCompare(b.code);
        }
        if (a.sortOrder === undefined) {
          return 1;
        }
        if (b.sortOrder === undefined) {
          return -1;
        }

        const orderDiff = a.sortOrder - b.sortOrder;
        if (orderDiff !== 0) {
          return orderDiff;
        }

        return a.code.localeCompare(b.code);
      });

      for (const node of nodes) {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      }
    };

    sortNodes(roots);
    return roots;
  }
}
