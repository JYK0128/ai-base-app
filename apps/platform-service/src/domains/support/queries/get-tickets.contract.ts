import { Query } from '@nestjs/cqrs';

import type { GetTicketsRequestDto } from './get-tickets.request.dto';
import type { GetTicketResponseDto } from './get-tickets.response.dto';

export class GetTicketsContract extends Query<GetTicketResponseDto[]> {
  constructor(public readonly data: GetTicketsRequestDto) {
    super();
  }
}
