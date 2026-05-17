import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TermsVersionStatus } from '@pkg/database';

import { AgreeTermsCommand, CreateTermsDocumentCommand, CreateTermsVersionCommand } from './commands';
import { GetActiveTermsQuery } from './queries';

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
  async createVersion(@Payload() data: {
    termsDocumentId: string
    label: string
    content: string
    effectiveFrom?: Date
    effectiveTo?: Date
    status?: TermsVersionStatus
  }) {
    return this.commandBus.execute(new CreateTermsVersionCommand(
      data.termsDocumentId,
      data.label,
      data.content,
      data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
      data.effectiveTo ? new Date(data.effectiveTo) : new Date('9999-12-31'),
      data.status ?? TermsVersionStatus.DRAFT,
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
