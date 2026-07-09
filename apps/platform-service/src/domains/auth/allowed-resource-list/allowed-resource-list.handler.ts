import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { AllowedResourceListContract } from './allowed-resource-list.contract';
import { AllowedResourceListItem, AllowedResourceListResponseDto } from './allowed-resource-list.response.dto';

@QueryHandler(AllowedResourceListContract)
export class AllowedResourceListHandler implements IQueryHandler<AllowedResourceListContract> {
  constructor(private readonly cls: ClsService) {}

  async execute(): Promise<AllowedResourceListResponseDto> {
    const permissions = this.identifyPermissions();
    this.verifyAllowedResources(permissions);
    return this.processTree(permissions);
  }

  private identifyPermissions(): string[] {
    const permissions = this.cls.get<string[]>('permissions');
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return [];
    }

    return permissions;
  }

  private verifyAllowedResources(_permissions: string[]): void {
    // 허용 리소스 목록 조회 정책 검증 영역
  }

  private async processTree(
    permissions: string[],
  ): Promise<AllowedResourceListResponseDto> {
    if (permissions.length === 0) {
      return new AllowedResourceListResponseDto({ items: [] });
    }

    const permissionSet = new Set(permissions);
    const resources = await Resource.getRepository().find(
      {},
      {
        populate: ['parent'],
        orderBy: { sortOrder: 'ASC', code: 'ASC' },
      },
    );
    const tree = this.buildResourceTreeResponse(resources);
    return new AllowedResourceListResponseDto({
      items: this.filterAuthorizedResources(tree, permissionSet),
    });
  }

  private filterAuthorizedResources(
    nodes: AllowedResourceListItem[],
    permissions: Set<string>,
  ): AllowedResourceListItem[] {
    return nodes
      .map((node) => ({
        ...node,
        children: this.filterAuthorizedResources(node.children, permissions),
      }))
      .filter((node) => this.isAuthorized(node, permissions) || node.children.length > 0);
  }

  private isAuthorized(
    node: AllowedResourceListItem,
    permissions: Set<string>,
  ): boolean {
    return node.actions.some((action) => permissions.has(`${node.code}:${action}`));
  }

  private buildResourceTreeResponse(resources: Resource[]): AllowedResourceListItem[] {
    const map = new Map<string, AllowedResourceListItem>();

    for (const resource of resources) {
      map.set(resource.id, this.toNode(resource));
    }

    const roots: AllowedResourceListItem[] = [];

    for (const resource of resources) {
      const node = map.get(resource.id);
      if (!node) continue;

      if (resource.parent?.id) {
        const parentNode = map.get(resource.parent.id);
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

  private sortResourceNodes(nodes: AllowedResourceListItem[]) {
    nodes.sort((left, right) => {
      if (left.sortOrder === null && right.sortOrder === null) {
        return left.code.localeCompare(right.code);
      }
      if (left.sortOrder === null) {
        return 1;
      }
      if (right.sortOrder === null) {
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

  private toNode(resource: Resource): AllowedResourceListItem {
    return new AllowedResourceListItem(resource);
  }
}
