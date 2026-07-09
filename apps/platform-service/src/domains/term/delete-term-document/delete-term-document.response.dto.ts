import { TermsDocument } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class DeleteTermDocumentResponseDto extends IdResponseDto<TermsDocument> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
