import type { Resource } from '@pkg/database';

import { IdRequestDto } from '@/common/interfaces';

export class GetResourceRequestDto extends IdRequestDto<Resource> {
}
