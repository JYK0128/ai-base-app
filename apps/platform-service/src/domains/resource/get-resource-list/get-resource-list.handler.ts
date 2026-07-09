import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Resource, ResourceScope } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { GetResourceListContract } from './get-resource-list.contract';
import { GetResourceListAsserter } from './get-resource-list.error';
import { GetResourceListItem, GetResourceListResponseDto } from './get-resource-list.response.dto';

@QueryHandler(GetResourceListContract)
export class GetResourceListHandler implements IQueryHandler<GetResourceListContract> {
  private readonly Asserter = GetResourceListAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetResourceListContract): Promise<GetResourceListResponseDto> {
    const organization = this.identifyOrganization();
    this.verifyResources(query, organization);
    return this.processList(query, organization);
  }

  private identifyOrganization(): AuthOrganizationContext | undefined {
    const organization = this.cls.get<AuthOrganizationContext>('organization');
    return organization;
  }

  private verifyResources(_query: GetResourceListContract, _organization: AuthOrganizationContext | undefined): void {
    // 리소스 목록 조회 정책 검증 영역
  }

  private async processList(
    query: GetResourceListContract,
    organization: AuthOrganizationContext | undefined,
  ): Promise<GetResourceListResponseDto> {
    const { orderBy } = query.data.toListOptions();
    const scope = query.data.filters.scope;
    const scopes = this.resolveScopes(scope, organization);

    const resources = await this.Asserter.assert(
      Resource.find(
        { scope: { $in: scopes } },
        {
          populate: ['parent'],
          orderBy,
        },
      ),
      'LOAD_FAILED',
    );

    const tree = this.buildResourceTreeResponse(resources);
    return new GetResourceListResponseDto({
      items: tree,
    });
  }

  private resolveScopes(
    scope: ResourceScope | undefined,
    organization: AuthOrganizationContext | undefined,
  ): ResourceScope[] {
    const nextScope = scope ?? ResourceScope.ORGANIZATION;

    if (organization?.code === 'platform' && nextScope === ResourceScope.ORGANIZATION) {
      return [ResourceScope.PLATFORM, ResourceScope.ORGANIZATION];
    }

    return [nextScope];
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
