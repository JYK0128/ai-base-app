import { Resource } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class DeleteResourceResponseDto extends IdResponseDto<Resource> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
