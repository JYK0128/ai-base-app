import { ApiProperty } from '@nestjs/swagger';

import { PayloadResponseDto } from '@/common/interfaces';

export class CsrfResponseDto extends PayloadResponseDto {
  @ApiProperty({
    example: '4f0a3e2c8f3d4a9b',
    description: 'CSRF 토큰',
  })
  csrfToken!: string;
}
