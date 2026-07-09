import { Resource } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class CreateResourceResponseDto extends IdResponseDto<Resource> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
