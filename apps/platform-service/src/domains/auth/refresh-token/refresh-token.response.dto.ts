import { withPayloadResponseDto } from '@/common/interfaces';

export class RefreshTokenResponseDto extends withPayloadResponseDto() {
  accessToken!: string;
  refreshToken!: string;
  id!: string;
}
