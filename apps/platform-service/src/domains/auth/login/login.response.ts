import { withCommandPayloadResponse } from '@/common/interfaces';

export class LoginResponseDto extends withCommandPayloadResponse() {
  accessToken!: string;
  refreshToken!: string;
}
