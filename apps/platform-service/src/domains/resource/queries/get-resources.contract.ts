import { Query } from '@nestjs/cqrs';

import type { GetResourcesRequestDto } from './get-resources.request.dto';
import type { ResourceResponseDto } from './get-resources.response.dto';

export class GetResourcesContract extends Query<ResourceResponseDto[]> {
  constructor(public readonly data: GetResourcesRequestDto) {
    super();
  }
}
