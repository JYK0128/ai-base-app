import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserDto {
  @ApiProperty({ example: 'user-uuid-123', description: '조회할 사용자 ID' })
  @IsString()
  @IsNotEmpty({ message: '사용자 ID는 필수입니다.' })
  userId!: string;
}
