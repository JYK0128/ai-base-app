import { EntityManager } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, Resource, ResourceScope } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildResourceTreeResponse } from '../resource.helper';
import { GetResourcesContract } from './get-resources.contract';
import { GetResourcesAsserter } from './get-resources.error';
import { ResourceResponseDto } from './get-resources.response.dto';

@QueryHandler(GetResourcesContract)
export class GetResourcesHandler implements IQueryHandler<GetResourcesContract> {
  private readonly Asserter = GetResourcesAsserter;

  constructor(
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetResourcesContract): Promise<ResourceResponseDto[]> {
    const resources = await this.identifyResources(query.data.scope);
    const tree = buildResourceTreeResponse(resources);

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
}
