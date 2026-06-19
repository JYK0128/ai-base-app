import { Query } from '@nestjs/cqrs';

import type { GetTicketPageRequestDto } from './get-ticket-page.request.dto';
import type { GetTicketResponseDto } from './get-ticket-page.response.dto';

export class GetTicketPageContract extends Query<GetTicketResponseDto[]> {
  constructor(public readonly data: GetTicketPageRequestDto) {
    super();
  }
}
