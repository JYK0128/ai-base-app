import { ApiProperty } from '@nestjs/swagger';

import { PayloadResponseDto } from '@/common/interfaces';
export class CsrfResponseDto extends PayloadResponseDto {
  @ApiProperty({ type: String, description: 'CSRF 토큰' })
  csrfToken!: string;
}
