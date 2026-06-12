import type { SupportTicket } from '@pkg/database';

import { TicketResponseDto } from './queries/get-tickets.response.dto';

export function buildTicketResponse(ticket: SupportTicket): TicketResponseDto {
  return new TicketResponseDto(ticket);
}
