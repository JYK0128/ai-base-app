import { withCommandPayloadRequest } from '@/common/interfaces';

export class LoginRequestDto extends withCommandPayloadRequest() {
  email!: string;
  password!: string;
  clientIp!: string;
}
