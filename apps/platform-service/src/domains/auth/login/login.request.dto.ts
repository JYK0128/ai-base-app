import { withPayloadRequestDto } from '@/common/interfaces';

export class LoginRequestDto extends withPayloadRequestDto() {
  email!: string;
  password!: string;
  clientIp!: string;
}
