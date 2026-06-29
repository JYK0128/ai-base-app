import { Query } from '@nestjs/cqrs';

import type { AllowedResourceListResponseDto } from './allowed-resource-list.response.dto';

export class AllowedResourceListContract extends Query<AllowedResourceListResponseDto> {
  constructor() {
    super();
  }
}
