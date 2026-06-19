import { Command } from '@nestjs/cqrs';

import type { CreateTermsAgreementRequestDto } from './agree-terms.request.dto';
import type { CreateTermsAgreementResponseDto } from './agree-terms.response.dto';

export class CreateTermsAgreementContract extends Command<CreateTermsAgreementResponseDto[]> {
  constructor(public readonly data: CreateTermsAgreementRequestDto) {
    super();
  }
}
