import { EntityManager } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { GetResourceAsserter } from './get-resource.error';
import { GetResourceQuery } from './get-resource.query';

export interface ResourceNodeDetail {
  id: string
  code: string
  name: string
  type: string
  path?: string
  icon?: string
  sortOrder?: number
  actions: string[]
  constraint?: string
  parentId?: string
}

@QueryHandler(GetResourceQuery)
export class GetResourceHandler implements IQueryHandler<GetResourceQuery> {
  private readonly Asserter = GetResourceAsserter;

  constructor(private readonly em: EntityManager) {}

  async execute(query: GetResourceQuery): Promise<ResourceNodeDetail> {
    const resource = await this.identifyResource(query.id);
    return this.processResource(resource);
  }

  private async identifyResource(id: string): Promise<Resource> {
    return await this.Asserter.assert(
      this.em.findOne(Resource, { id }, { populate: ['parent'] }),
      'RESOURCE_NOT_FOUND',
    );
  }

  private processResource(resource: Resource): ResourceNodeDetail {
    return {
      id: resource.id,
      code: resource.code,
      name: resource.name,
      type: resource.type,
      path: resource.path,
      icon: resource.icon,
      sortOrder: resource.sortOrder,
      actions: resource.actions || [],
      constraint: resource.constraint,
      parentId: resource.parent?.id,
    };
  }
}
