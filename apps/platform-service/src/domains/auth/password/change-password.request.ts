import { withCommandPayloadRequest } from '@/common/interfaces';

export class ChangePasswordRequestDto extends withCommandPayloadRequest() {
  accountId!: string;
  currentPassword!: string;
  newPassword!: string;
}
