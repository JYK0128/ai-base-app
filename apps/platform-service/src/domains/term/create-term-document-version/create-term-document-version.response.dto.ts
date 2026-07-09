import { TermsVersion } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class CreateTermDocumentVersionResponseDto extends IdResponseDto<TermsVersion> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
