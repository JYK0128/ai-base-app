import { withPayloadResponseDto } from '@/common/interfaces';

export class LoginResponseDto extends withPayloadResponseDto() {
  accessToken!: string;
  refreshToken!: string;
}
