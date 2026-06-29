import { Organization } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class ApproveOrganizationResponseDto extends IdResponseDto<Organization> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
