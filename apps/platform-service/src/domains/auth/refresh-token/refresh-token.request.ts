import { withCommandPayloadRequest } from '@/common/interfaces';

export class RefreshTokenRequestDto extends withCommandPayloadRequest() {
  refreshToken!: string;
}
