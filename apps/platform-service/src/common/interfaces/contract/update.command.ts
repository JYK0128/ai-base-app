import type { Type } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import type { EntityRequestDto } from '../request/entity.request.dto';
import type { IdRequestDto } from '../request/id.request.dto';
import type { AffectedRowsResponseDto } from '../response/affected-rows.response.dto';

export abstract class UpdateCommand<TEntity extends Type> extends Command<AffectedRowsResponseDto<TEntity>> {
  constructor(
    public readonly condition: IdRequestDto<TEntity>,
    public readonly data: EntityRequestDto<TEntity>,
  ) {
    super();
  }
}
