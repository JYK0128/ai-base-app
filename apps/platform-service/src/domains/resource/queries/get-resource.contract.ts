import { Query } from '@nestjs/cqrs';

import type { GetResourceRequestDto } from './get-resource.request.dto';
import type { GetResourceResponseDto } from './get-resource.response.dto';

export class GetResourceContract extends Query<GetResourceResponseDto> {
  constructor(public readonly data: GetResourceRequestDto) {
    super();
  }
}
