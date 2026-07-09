import { Command } from '@nestjs/cqrs';

import type { UpdateOrganizationRoleSortRequestDto } from './update-organization-role-sort.request.dto';
import type { UpdateOrganizationRoleSortResponseDto } from './update-organization-role-sort.response.dto';

export class UpdateOrganizationRoleSortContract extends Command<UpdateOrganizationRoleSortResponseDto> {
  constructor(public readonly data: UpdateOrganizationRoleSortRequestDto) {
    super();
  }
}
