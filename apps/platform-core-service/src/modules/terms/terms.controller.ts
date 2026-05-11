import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AgreeTermsCommand } from './commands/agree-terms.handler';
import { CreateTermsDocumentCommand } from './commands/create-terms-document.handler';
import { CreateTermsVersionCommand } from './commands/create-terms-version.handler';
import { GetActiveTermsQuery } from './queries/get-active-terms.handler';

@Controller()
export class TermsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern('terms.get.active')
  async getActiveTerms(@Payload() data: { organizationId?: string }) {
    return this.queryBus.execute(new GetActiveTermsQuery(data.organizationId));
  }

  @MessagePattern('terms.create.document')
  async createDocument(@Payload() data: { code: string, title: string, required?: boolean, organizationId?: string }) {
    return this.commandBus.execute(new CreateTermsDocumentCommand(
      data.code,
      data.title,
      data.required ?? true,
      data.organizationId,
    ));
  }

  @MessagePattern('terms.create.version')
  async createVersion(@Payload() data: { termsDocumentId: string, versionLabel: string, content: string, publish?: boolean }) {
    return this.commandBus.execute(new CreateTermsVersionCommand(
      data.termsDocumentId,
      data.versionLabel,
      data.content,
      data.publish ?? false,
    ));
  }

  @MessagePattern('terms.agree')
  async agreeTerms(@Payload() data: { managerId: string, termsVersionId: string, organizationId?: string, source?: string, ipAddress?: string, userAgent?: string }) {
    return this.commandBus.execute(new AgreeTermsCommand(
      data.managerId,
      data.termsVersionId,
      data.organizationId,
      data.source,
      data.ipAddress,
      data.userAgent,
    ));
  }
}
