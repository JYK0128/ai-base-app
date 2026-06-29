import type { Organization } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class UpdateOrganizationResponseDto extends IdResponseDto<Organization> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
