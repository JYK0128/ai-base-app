import { withPayloadRequestDto } from '@/common/interfaces';

export class RefreshTokenRequestDto extends withPayloadRequestDto() {
  refreshToken!: string;
}
