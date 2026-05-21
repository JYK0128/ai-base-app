import { EntityManager } from '@mikro-orm/core';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { GetResourcesAsserter, GetResourcesCommand } from './get-resources.helpers';

export interface ResourceTreeNode {
  id: string
  code: string
  name: string
  type: string
  path?: string
  icon?: string
  sortOrder?: number
  actions: string[]
  mappedAction?: string
  translations?: Record<string, string>
  children: ResourceTreeNode[]
}

/**
 * 자원 트리 조회 핸들러
 */
@CommandHandler(GetResourcesCommand)
export class GetResourcesHandler implements ICommandHandler<GetResourcesCommand> {
  private readonly Asserter = GetResourcesAsserter;

  constructor(private readonly em: EntityManager) {}

  async execute(command: GetResourcesCommand): Promise<ResourceTreeNode[]> {
    const resources = await this.identifyResources();
    const tree = this.processResources(resources);

    if (command.permissions || command.roles) {
      return this.filterAllowedResources(
        tree,
        command.permissions ?? [],
        command.roles ?? [],
      );
    }

    return tree;
  }

  private filterAllowedResources(
    nodes: ResourceTreeNode[],
    userPermissions: string[],
    userRoles: string[],
  ): ResourceTreeNode[] {
    // 슈퍼어드민 바이패스
    if (userRoles.some((role) => role === 'SUPERADMIN')) {
      return nodes;
    }

    return nodes
      .map((node) => {
        // 자식 노드 필터링
        const filteredChildren = node.children
          ? this.filterAllowedResources(node.children, userPermissions, userRoles)
          : [];

        // 현재 노드의 READ 권한 검사
        const requiredPermission = `${node.code}:READ`;
        const hasDirectPermission = userPermissions.some((owned) => owned === requiredPermission);

        // 직접 권한이 있거나, 자녀 중에 허용된 노드가 있는 경우 노드를 유지
        if (hasDirectPermission || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter((node): node is ResourceTreeNode => node !== null);
  }

  private async identifyResources(): Promise<Resource[]> {
    return await this.Asserter.assert(
      this.em.find(
        Resource,
        {},
        {
          orderBy: { sortOrder: 'ASC' },
        },
      ),
      'LOAD_FAILED',
    );
  }

  private processResources(resources: Resource[]): ResourceTreeNode[] {
    const map = new Map<string, ResourceTreeNode>();

    // 1. 모든 자원을 트리 노드 형식으로 변환하여 Map에 보관
    for (const res of resources) {
      map.set(res.id, {
        id: res.id,
        code: res.code,
        name: res.name,
        type: res.type,
        path: res.path,
        icon: res.icon,
        sortOrder: res.sortOrder,
        actions: res.actions || [],
        mappedAction: res.mappedAction,
        translations: res.translations,
        children: [],
      });
    }

    const roots: ResourceTreeNode[] = [];

    // 2. 부모-자식 관계에 맞춰 트리 조립
    for (const res of resources) {
      const node = map.get(res.id);
      if (!node) continue;

      if (res.parent) {
        const parentId = res.parent.id;
        const parentNode = map.get(parentId);
        if (parentNode) {
          parentNode.children.push(node);
        }
        else {
          roots.push(node);
        }
      }
      else {
        roots.push(node);
      }
    }

    // 3. 자식 요소들을 sortOrder 기준으로 정렬
    const sortChildren = (nodes: ResourceTreeNode[]) => {
      nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      for (const node of nodes) {
        if (node.children.length > 0) {
          sortChildren(node.children);
        }
      }
    };

    sortChildren(roots);
    return roots;
  }
}
