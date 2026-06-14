import { Command } from '@nestjs/cqrs';

import type { MemberTermsConsentResponseDto } from '../queries/get-terms-document.response.dto';
import type { AgreeTermsRequestDto } from './agree-terms.request.dto';

export class AgreeTermsContract extends Command<MemberTermsConsentResponseDto> {
  constructor(public readonly data: AgreeTermsRequestDto) {
    super();
  }
}
