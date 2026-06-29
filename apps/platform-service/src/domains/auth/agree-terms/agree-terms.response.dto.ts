import { TermsConsent } from '@pkg/database';

import { IdListResponseDto } from '@/common/interfaces';

export class CreateTermsAgreementResponseDto extends IdListResponseDto<TermsConsent> {
  constructor(consents: TermsConsent[]) {
    super();
    this.ids = consents.map((consent) => consent.id);
  }
}
