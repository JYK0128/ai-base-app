import { OrganizationRole } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class UpdateOrganizationRoleResponseDto extends IdResponseDto<OrganizationRole> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
