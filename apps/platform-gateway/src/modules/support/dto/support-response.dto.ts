import { ApiProperty } from '@nestjs/swagger';

export class TicketResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7093', description: '티켓 식별자' })
  id!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  organizationId!: string;

  @ApiProperty({ example: '로그인 문제', description: '티켓 제목' })
  title!: string;

  @ApiProperty({ example: '계정에 로그인할 수 없습니다...', description: '티켓 내용' })
  content!: string;

  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], description: '티켓 상태' })
  status!: string;

  @ApiProperty({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], description: '우선순위' })
  priority!: string;

  @ApiProperty({ example: '2024-05-10T00:00:00Z', description: '생성 일시' })
  createdAt!: string;
}
