import { Query } from '@nestjs/cqrs';

import type { GetResourceRequestDto } from './get-resource.request.dto';
import type { ResourceDetailResponseDto } from './get-resource.response.dto';

export class GetResourceContract extends Query<ResourceDetailResponseDto> {
  constructor(public readonly data: GetResourceRequestDto) {
    super();
  }
}
