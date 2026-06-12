import { withPayloadRequestDto } from '@/common/interfaces';

export class ChangePasswordRequestDto extends withPayloadRequestDto() {
  accountId!: string;
  currentPassword!: string;
  newPassword!: string;
}
