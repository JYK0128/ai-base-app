import { withCommandPayloadResponse } from '@/common/interfaces';

export class RefreshTokenResponseDto extends withCommandPayloadResponse() {
  accessToken!: string;
  refreshToken!: string;
  id!: string;
}
