import { Query } from '@nestjs/cqrs';

import type { GetResourceListResponseDto } from '../get-resource-list/get-resource-list.response.dto';

export class GetPermissionMapListContract extends Query<GetResourceListResponseDto> {
  constructor() {
    super();
  }
}
