import { Query } from '@nestjs/cqrs';

import type { GetOrganizationRoleResponseDto } from './get-organization-roles.response.dto';

export class GetOrganizationRolesContract extends Query<GetOrganizationRoleResponseDto[]> {
  constructor() {
    super();
  }
}
