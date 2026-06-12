import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetMemberContract } from './queries/get-member.contract';
import type { GetMemberRequestDto } from './queries/get-member.request.dto';
import type { MemberResponseDto } from './queries/get-member.response.dto';

@Controller('members')
export class MembersController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  async getMember(
    @Param('id') id: string,
  ): Promise<MemberResponseDto> {
    return this.queryBus.execute(new GetMemberContract({ id } satisfies GetMemberRequestDto));
  }
}
