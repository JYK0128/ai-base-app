import { withPayloadRequestDto } from '@/common/interfaces';

export class DeferPasswordChangeRequestDto extends withPayloadRequestDto() {
  accountId!: string;
}
