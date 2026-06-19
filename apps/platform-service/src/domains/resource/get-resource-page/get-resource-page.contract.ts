import { Query } from '@nestjs/cqrs';

import type { GetResourcePageRequestDto } from './get-resource-page.request.dto';
import type { GetResourceResponseDto } from './get-resource-page.response.dto';

export class GetResourcePageContract extends Query<GetResourceResponseDto[]> {
  constructor(public readonly data: GetResourcePageRequestDto) {
    super();
  }
}
