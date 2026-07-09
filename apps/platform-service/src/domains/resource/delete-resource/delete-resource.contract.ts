import { Command } from '@nestjs/cqrs';

import type { DeleteResourceRequestDto } from './delete-resource.request.dto';
import type { DeleteResourceResponseDto } from './delete-resource.response.dto';

export class DeleteResourceContract extends Command<DeleteResourceResponseDto> {
  constructor(public readonly data: DeleteResourceRequestDto) {
    super();
  }
}
