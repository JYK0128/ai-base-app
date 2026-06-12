import { EntityManager } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { GetResourceContract } from './get-resource.contract';
import { GetResourceAsserter } from './get-resource.error';
import { ResourceDetailResponseDto } from './get-resource.response.dto';

@QueryHandler(GetResourceContract)
export class GetResourceHandler implements IQueryHandler<GetResourceContract> {
  private readonly Asserter = GetResourceAsserter;

  constructor(private readonly em: EntityManager) {}

  async execute(query: GetResourceContract): Promise<ResourceDetailResponseDto> {
    const resource = await this.identifyResource(query.data.id);
    return new ResourceDetailResponseDto({
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
    });
  }

  private async identifyResource(id: string): Promise<Resource> {
    const resource: Resource = await this.Asserter.assert(
      this.em.findOne(Resource, { id }, { populate: ['parent'] }),
      'RESOURCE_NOT_FOUND',
    );
    return resource;
  }
}
