import { Query } from '@nestjs/cqrs';

import type { GetResourcesRequestDto } from './get-resources.request.dto';
import type { GetResourceResponseDto } from './get-resources.response.dto';

export class GetResourcesContract extends Query<GetResourceResponseDto[]> {
  constructor(public readonly data: GetResourcesRequestDto) {
    super();
  }
}
