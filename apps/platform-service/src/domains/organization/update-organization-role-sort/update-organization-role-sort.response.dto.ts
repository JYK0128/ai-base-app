import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';

import { IdListResponseDto } from '@/common/interfaces';

export class UpdateOrganizationRoleSortResponseDto extends IdListResponseDto<OrganizationRole> {
  constructor(ids: string[]) {
    super();
    this.ids = ids;
  }

  @ApiProperty({ isArray: true, type: String, description: '정렬이 갱신된 조직 역할 식별자 목록' })
  override ids!: string[];
}
