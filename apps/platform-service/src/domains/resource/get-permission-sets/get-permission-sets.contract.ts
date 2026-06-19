import { Query } from '@nestjs/cqrs';

import type { GetPermissionSetResponseDto } from './get-permission-sets.response.dto';

export class GetPermissionSetsContract extends Query<GetPermissionSetResponseDto[]> {
  constructor() {
    super();
  }
}
