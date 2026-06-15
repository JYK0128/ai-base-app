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
    return new GetResourceResponseDto(resource);
  }

  private async identifyResource(id: string): Promise<Resource> {
    const resource: Resource = await this.Asserter.assert(
      this.em.findOne(Resource, { id }, { populate: ['parent'] }),
      'RESOURCE_NOT_FOUND',
    );
    return resource;
  }
}
