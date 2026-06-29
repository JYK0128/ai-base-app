import { Query } from '@nestjs/cqrs';

import type { GetResourceListRequestDto } from './get-resource-list.request.dto';
import type { GetResourceListResponseDto } from './get-resource-list.response.dto';

export class GetResourceListContract extends Query<GetResourceListResponseDto> {
  constructor(public readonly data: GetResourceListRequestDto) {
    super();
  }
}
