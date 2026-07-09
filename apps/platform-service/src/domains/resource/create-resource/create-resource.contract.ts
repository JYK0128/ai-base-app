import { Command } from '@nestjs/cqrs';

import type { CreateResourceRequestDto } from './create-resource.request.dto';
import type { CreateResourceResponseDto } from './create-resource.response.dto';

export class CreateResourceContract extends Command<CreateResourceResponseDto> {
  constructor(public readonly data: CreateResourceRequestDto) {
    super();
  }
}
