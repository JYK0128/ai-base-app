import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Organization } from '@pkg/database';
import type { AuthAccountContext, AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { UpdateOrganizationContract } from './update-organization.contract';
import { UpdateOrganizationAsserter } from './update-organization.error';
import { UpdateOrganizationResponseDto } from './update-organization.response.dto';

@CommandHandler(UpdateOrganizationContract)
export class UpdateOrganizationHandler implements ICommandHandler<UpdateOrganizationContract> {
  private readonly Asserter = UpdateOrganizationAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: UpdateOrganizationContract): Promise<UpdateOrganizationResponseDto> {
    const account = await this.identifyRequestAccount();
    const organization = await this.identifyOrganization();
    const email = command.data.email.trim();

    await this.verifyEmailAvailability(organization, email);
    await this.processUpdate(command, organization, account.id);

    return new UpdateOrganizationResponseDto(organization.id);
  }

  private async identifyRequestAccount(): Promise<AuthAccountContext> {
    const account = this.cls.get('account');

    if (!account) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return account;
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Organization.findOne({ id: organization.id }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async verifyEmailAvailability(organization: Organization, email: string): Promise<void> {
    const existingOrganization = await Organization.findOne({
      email,
      id: { $ne: organization.id },
    });

    if (existingOrganization) {
      return this.Asserter.throw('ORGANIZATION_EMAIL_ALREADY_EXISTS');
    }
  }

  private async processUpdate(
    command: UpdateOrganizationContract,
    organization: Organization,
    accountId: string,
  ): Promise<void> {
    const { name, email } = command.data;
    const result = await Organization
      .getQueryBuilder()
      .update({
        name,
        email,
        updatedAt: new Date(),
        updatedBy: accountId,
      })
      .where({ id: organization.id })
      .execute();

    if (result.affectedRows === 0) {
      await this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }
  }
}
