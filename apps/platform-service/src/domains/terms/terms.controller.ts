import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetActiveTermsContract } from './queries/get-active-terms.contract';
import type { TermsDocumentResponseDto } from './queries/get-active-terms.response.dto';

@Controller('terms')
export class TermsController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getActiveTerms(): Promise<TermsDocumentResponseDto[]> {
    return this.queryBus.execute(new GetActiveTermsContract());
  }
}
