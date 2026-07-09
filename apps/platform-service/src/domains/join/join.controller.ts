import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';
import { Public } from '@/common/decorators/public.decorator';

import { AcceptJoinContract } from './accept/accept-join.contract';
import { AcceptJoinRequestDto } from './accept/accept-join.request.dto';
import { AcceptJoinResponseDto } from './accept/accept-join.response.dto';
import { VerifyJoinContract } from './verify/verify-join.contract';
import { VerifyJoinRequestDto } from './verify/verify-join.request.dto';
import { VerifyJoinResponseDto } from './verify/verify-join.response.dto';

@Public()
@Controller('join')
export class JoinController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('verify')
  @SwaggerResponse(VerifyJoinResponseDto)
  async verify(
    @Query() query: VerifyJoinRequestDto,
  ): Promise<VerifyJoinResponseDto> {
    return this.queryBus.execute(new VerifyJoinContract(query));
  }

  @Post()
  @SwaggerResponse(AcceptJoinResponseDto)
  async accept(
    @Body() body: AcceptJoinRequestDto,
  ): Promise<AcceptJoinResponseDto> {
    return this.commandBus.execute(new AcceptJoinContract(body));
  }
}
