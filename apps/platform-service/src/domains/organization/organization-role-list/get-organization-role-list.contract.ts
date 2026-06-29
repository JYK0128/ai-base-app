import { Query } from '@nestjs/cqrs';

import type { GetOrganizationRoleListResponseDto } from './get-organization-role-list.response.dto';

export class GetOrganizationRoleListContract extends Query<GetOrganizationRoleListResponseDto> {
  constructor() {
    super();
  }
}
