import { Query } from '@nestjs/cqrs';

import type { GetRolePermissionListResponseDto } from './get-role-permission-list.response.dto';

export class GetRolePermissionListContract extends Query<GetRolePermissionListResponseDto> {
  constructor() {
    super();
  }
}
