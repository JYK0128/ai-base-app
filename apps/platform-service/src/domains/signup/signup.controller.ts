import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { SwaggerResponse } from '@/common/decorators';
import { Public } from '@/common/decorators/public.decorator';

import { GetSignupTermListContract } from './get-signup-term-list/get-signup-term-list.contract';
import { GetSignupTermListResponseDto } from './get-signup-term-list/get-signup-term-list.response.dto';

@Public()
@Controller('signup')
export class SignupController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('terms')
  @SwaggerResponse(GetSignupTermListResponseDto)
  async getSignupTermList(): Promise<GetSignupTermListResponseDto> {
    return this.queryBus.execute(new GetSignupTermListContract());
  }
}
