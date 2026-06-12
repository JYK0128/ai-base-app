import { Query } from '@nestjs/cqrs';

import type { GetTicketsRequestDto } from './get-tickets.request.dto';
import type { TicketResponseDto } from './get-tickets.response.dto';

export class GetTicketsContract extends Query<TicketResponseDto[]> {
  constructor(public readonly data: GetTicketsRequestDto) {
    super();
  }
}
