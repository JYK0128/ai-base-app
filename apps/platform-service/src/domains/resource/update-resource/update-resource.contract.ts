import { Command } from '@nestjs/cqrs';

import type { UpdateResourceRequestDto } from './update-resource.request.dto';
import type { UpdateResourceResponseDto } from './update-resource.response.dto';

export class UpdateResourceContract extends Command<UpdateResourceResponseDto> {
  constructor(public readonly data: UpdateResourceRequestDto) {
    super();
  }
}
