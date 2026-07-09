import type { TermsDocument } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class ScheduleTermDocumentTerminationResponseDto extends IdResponseDto<TermsDocument> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
