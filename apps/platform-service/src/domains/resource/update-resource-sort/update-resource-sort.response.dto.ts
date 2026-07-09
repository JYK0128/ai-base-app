import { Resource } from '@pkg/database';

import { IdListResponseDto } from '@/common/interfaces';

export class UpdateResourceSortResponseDto extends IdListResponseDto<Resource> {
  constructor(ids: string[]) {
    super();
    this.ids = ids;
  }
}
