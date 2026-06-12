import type { Type } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import type { IdRequestDto } from '../request/id.request.dto';
import type { AffectedRowsResponseDto } from '../response/affected-rows.response.dto';

export abstract class DeleteCommand<TEntity extends Type> extends Command<AffectedRowsResponseDto<TEntity>> {
  constructor(public readonly condition: IdRequestDto<TEntity>) {
    super();
  }
}
