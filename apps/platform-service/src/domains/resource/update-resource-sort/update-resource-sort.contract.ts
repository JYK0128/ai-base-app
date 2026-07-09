import { Command } from '@nestjs/cqrs';

import type { UpdateResourceSortRequestDto } from './update-resource-sort.request.dto';
import type { UpdateResourceSortResponseDto } from './update-resource-sort.response.dto';

export class UpdateResourceSortContract extends Command<UpdateResourceSortResponseDto> {
  constructor(public readonly data: UpdateResourceSortRequestDto) {
    super();
  }
}
