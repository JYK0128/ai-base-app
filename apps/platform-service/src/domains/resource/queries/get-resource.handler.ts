import { EntityManager } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { GetResourceContract } from './get-resource.contract';
import { GetResourceAsserter } from './get-resource.error';
import { GetResourceResponseDto } from './get-resource.response.dto';

@QueryHandler(GetResourceContract)
export class GetResourceHandler implements IQueryHandler<GetResourceContract> {
  private readonly Asserter = GetResourceAsserter;

  constructor(private readonly em: EntityManager) {}

  async execute(query: GetResourceContract): Promise<GetResourceResponseDto> {
    const resource = await this.identifyResource(query.data.id);
    const data = {
      id: resource.id,
      code: resource.code,
      name: resource.name,
      type: resource.type,
      scope: resource.scope,
      actions: resource.actions,
      ...(resource.path !== undefined ? { path: resource.path } : {}),
      ...(resource.icon !== undefined ? { icon: resource.icon } : {}),
      ...(resource.sortOrder !== undefined ? { sortOrder: resource.sortOrder } : {}),
      ...(resource.constraint !== undefined ? { constraint: resource.constraint } : {}),
      ...(resource.parent?.id !== undefined ? { parentId: resource.parent.id } : {}),
    };

    return new GetResourceResponseDto(data);
  }

  private async identifyResource(id: string): Promise<Resource> {
    const resource: Resource = await this.Asserter.assert(
      this.em.findOne(Resource, { id }, { populate: ['parent'] }),
      'RESOURCE_NOT_FOUND',
    );
    return resource;
  }
}
