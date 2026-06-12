import { Query } from '@nestjs/cqrs';

import type { GetMeResponsePayload } from './get-me.response';

export class GetMeQuery extends Query<GetMeResponsePayload> {}
