import { withCommandPayloadRequest } from '@/common/interfaces';

export class DeferPasswordChangeRequestDto extends withCommandPayloadRequest() {
  accountId!: string;
}
