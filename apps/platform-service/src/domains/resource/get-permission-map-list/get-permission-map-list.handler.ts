import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Resource, ResourceScope, ResourceType } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { GetResourceListAsserter } from '../get-resource-list/get-resource-list.error';
import { GetResourceListItem, GetResourceListResponseDto } from '../get-resource-list/get-resource-list.response.dto';
import { GetPermissionMapListContract } from './get-permission-map-list.contract';

@QueryHandler(GetPermissionMapListContract)
export class GetPermissionMapListHandler implements IQueryHandler<GetPermissionMapListContract> {
  private readonly Asserter = GetResourceListAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<GetResourceListResponseDto> {
    const organization = this.identifyOrganization();
    this.verifyResources(organization);
    return this.processList(organization);
  }

  private identifyOrganization(): AuthOrganizationContext | undefined {
    return this.cls.get<AuthOrganizationContext>('organization');
  }

  private verifyResources(_organization: AuthOrganizationContext | undefined): void {
    // 권한 맵 조회 정책 검증 영역
  }

  private async processList(organization: AuthOrganizationContext | undefined): Promise<GetResourceListResponseDto> {
    const scopes = organization?.code === 'platform'
      ? [ResourceScope.PLATFORM, ResourceScope.ORGANIZATION]
      : [ResourceScope.ORGANIZATION];

    const resources = await this.Asserter.assert(
      Resource.find(
        scopes.length === 1
          ? { scope: scopes[0], type: ResourceType.MENU }
          : { scope: { $in: scopes }, type: ResourceType.MENU },
        {
          populate: ['parent'],
          orderBy: { sortOrder: 'asc', code: 'asc' },
        },
      ),
      'LOAD_FAILED',
    );

    const tree = this.buildResourceTreeResponse(resources);
    return new GetResourceListResponseDto({
      items: tree,
    });
  }

  private buildResourceTreeResponse(resources: Resource[]): GetResourceListItem[] {
    const map = new Map<string, GetResourceListItem>();

    for (const resource of resources) {
      map.set(resource.id, new GetResourceListItem(resource));
    }

    const roots: GetResourceListItem[] = [];

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

  private sortResourceNodes(nodes: GetResourceListItem[]) {
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
}
