import { Query } from '@nestjs/cqrs';

import type { GetMeResponseDto } from './get-me.response.dto';

export class GetMeQuery extends Query<GetMeResponseDto> {}
