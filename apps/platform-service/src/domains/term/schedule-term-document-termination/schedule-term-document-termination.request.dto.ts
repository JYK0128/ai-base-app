import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class ScheduleTermDocumentTerminationRequestDto {
  @ApiProperty({ example: '2026-07-04T12:30:00.000Z', type: String, description: '종료 일시' })
  @Type(() => Date)
  @IsDate()
  terminatedAt!: Date;
}
