import type { TermsVersion } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class UpdateTermDocumentVersionResponseDto extends IdResponseDto<TermsVersion> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
