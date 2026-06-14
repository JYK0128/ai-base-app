import { Command } from '@nestjs/cqrs';

import type { CreateTermsAgreementResponseDto } from '../queries/get-terms-document.response.dto';
import type { CreateTermsAgreementRequestDto } from './agree-terms.request.dto';

export class CreateTermsAgreementContract extends Command<CreateTermsAgreementResponseDto> {
  constructor(public readonly data: CreateTermsAgreementRequestDto) {
    super();
  }
}
