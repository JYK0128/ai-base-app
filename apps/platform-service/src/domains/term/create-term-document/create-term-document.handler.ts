import { Transactional } from '@mikro-orm/decorators/legacy';
import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Organization, TermsDocument, TermsDocumentScope } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { CreateTermDocumentContract } from './create-term-document.contract';
import { CreateTermDocumentResponseDto } from './create-term-document.response.dto';

function normalizeCode(code: string): string {
  return code.trim().replace(/\s+/g, '_').replace(/-+/g, '_').toUpperCase();
}

@CommandHandler(CreateTermDocumentContract)
export class CreateTermDocumentHandler implements ICommandHandler<CreateTermDocumentContract> {
  constructor(private readonly cls: ClsService) {}

  @Transactional()
  async execute(command: CreateTermDocumentContract): Promise<CreateTermDocumentResponseDto> {
    const organization = this.identifyOrganization(command);
    this.verifyCreation(command, organization);
    const document = this.processCreation(command, organization);

    return new CreateTermDocumentResponseDto(document.id);
  }

  private identifyOrganization(
    command: CreateTermDocumentContract,
  ): AuthOrganizationContext | undefined {
    if (command.data.scope === TermsDocumentScope.PLATFORM) {
      return undefined;
    }

    return this.cls.get<AuthOrganizationContext>('organization');
  }

  private verifyCreation(
    command: CreateTermDocumentContract,
    organization: AuthOrganizationContext | undefined,
  ): void {
    if (command.data.scope === TermsDocumentScope.ORGANIZATION && !organization) {
      throw new BadRequestException('ORGANIZATION_CONTEXT_NOT_FOUND');
    }
  }

  private processCreation(
    command: CreateTermDocumentContract,
    organization: AuthOrganizationContext | undefined,
  ): TermsDocument {
    return TermsDocument.create({
      code: normalizeCode(command.data.code),
      title: command.data.title.trim(),
      required: command.data.required,
      organization: organization ? Organization.getReference(organization.id) : null,
    });
  }
}
