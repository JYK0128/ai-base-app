import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetMemberContract } from './queries/get-member.contract';
import type { GetMemberRequestDto } from './queries/get-member.request.dto';
import type { MemberResponseDto } from './queries/get-member.response.dto';
import { GetMembersContract } from './queries/get-members.contract';
import type { GetMembersRequestDto } from './queries/get-members.request.dto';

@Controller('members')
export class MembersController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getMembers(
    @Query() query: GetMembersRequestDto,
  ): Promise<MemberResponseDto[]> {
    return this.queryBus.execute(new GetMembersContract(query));
  }

  @Get(':id')
  async getMember(
    @Param('id') id: string,
  ): Promise<MemberResponseDto> {
    return this.queryBus.execute(new GetMemberContract({ id } satisfies GetMemberRequestDto));
  }
}
