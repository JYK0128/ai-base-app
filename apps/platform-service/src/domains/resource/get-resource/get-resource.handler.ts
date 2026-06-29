import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { GetResourceContract } from './get-resource.contract';
import { GetResourceAsserter } from './get-resource.error';
import { GetResourceResponseDto } from './get-resource.response.dto';

@QueryHandler(GetResourceContract)
export class GetResourceHandler implements IQueryHandler<GetResourceContract> {
  private readonly Asserter = GetResourceAsserter;

  async execute(query: GetResourceContract): Promise<GetResourceResponseDto> {
    this.verifyResource(query);
    return this.processDetail(query);
  }

  private verifyResource(_query: GetResourceContract): void {
    // 리소스 조회 정책 검증 영역
  }

  private async processDetail(query: GetResourceContract): Promise<GetResourceResponseDto> {
    const resource = await this.Asserter.assert(
      Resource.findOne({ id: query.data.id }, { populate: ['parent'] }),
      'RESOURCE_NOT_FOUND',
    );

    return new GetResourceResponseDto(resource);
  }
}
