import { Query } from '@nestjs/cqrs';

import type { PermissionSetResponseDto } from './get-permission-sets.response.dto';

export class GetPermissionSetsContract extends Query<PermissionSetResponseDto[]> {
  constructor() {
    super();
  }
}
