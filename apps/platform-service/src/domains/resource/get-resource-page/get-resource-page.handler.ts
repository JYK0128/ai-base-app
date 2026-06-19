import { EntityManager } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, Resource, ResourceScope } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetResourcePageContract } from './get-resource-page.contract';
import { GetResourcePageAsserter } from './get-resource-page.error';
import { GetResourceResponseDto } from './get-resource-page.response.dto';

@QueryHandler(GetResourcePageContract)
export class GetResourcePageHandler implements IQueryHandler<GetResourcePageContract> {
  private readonly Asserter = GetResourcePageAsserter;

  constructor(
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetResourcePageContract): Promise<GetResourceResponseDto[]> {
    const resources = await this.identifyResources(query.data.filters.scope);
    const tree = this.buildResourceTreeResponse(resources);
    return tree;
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

  private buildResourceTreeResponse(resources: Resource[]): GetResourceResponseDto[] {
    const map = new Map<string, GetResourceResponseDto>();

    for (const resource of resources) {
      map.set(resource.id, new GetResourceResponseDto(resource));
    }

    const roots: GetResourceResponseDto[] = [];

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

  private sortResourceNodes(nodes: GetResourceResponseDto[]) {
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
