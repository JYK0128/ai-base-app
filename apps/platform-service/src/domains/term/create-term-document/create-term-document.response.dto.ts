import type { TermsDocument } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class CreateTermDocumentResponseDto extends IdResponseDto<TermsDocument> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
