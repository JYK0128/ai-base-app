import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, ManagerAccountRepository, ManagerRoleRepository, OrganizationRepository, OrganizationStatus, RoleRepository } from '@pkg/database';

import { ENV } from '@/common/env';
import { TokenUtil } from '@/common/utils/token.util';
import { RedisService } from '@/modules/redis/redis.service';

export { CreateOnboardingOrganizationCommand } from './create-onboarding-organization.handler.helpers';
import { CreateOnboardingOrganizationAsserter, CreateOnboardingOrganizationCommand } from './create-onboarding-organization.handler.helpers';

@CommandHandler(CreateOnboardingOrganizationCommand)
export class CreateOnboardingOrganizationHandler implements ICommandHandler<CreateOnboardingOrganizationCommand> {
  private readonly OnboardingGuard = CreateOnboardingOrganizationAsserter;

  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly roleRepository: RoleRepository,
    private readonly managerRoleRepository: ManagerRoleRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  @Transactional()
  async execute(command: CreateOnboardingOrganizationCommand): Promise<{ accessToken: string, refreshToken: string }> {
    const account = await this.OnboardingGuard.assert(
      await this.managerAccountRepository.findOne(
        { id: command.id },
        { populate: ['manager.organization'] },
      ),
      'ACCOUNT_NOT_FOUND',
    );

    await this.OnboardingGuard.throwIf(account.status !== AccountStatus.ACTIVE, 'ACCOUNT_NOT_VERIFIED');
    await this.OnboardingGuard.throwIf(!!account.manager.organization, 'ORGANIZATION_ALREADY_EXISTS');
    await this.OnboardingGuard.throwIf(
      !!(await this.organizationRepository.findOne({ code: command.organizationCode })),
      'ORGANIZATION_CODE_EXISTS',
    );
    await this.OnboardingGuard.throwIf(
      !!(await this.organizationRepository.findOne({ email: command.organizationEmail })),
      'ORGANIZATION_EMAIL_EXISTS',
    );

    const role = await this.OnboardingGuard.assert(
      await this.roleRepository.findOne({ code: 'organization_admin' }),
      'ROLE_NOT_FOUND',
    );

    const organization = this.organizationRepository.create({
      code: command.organizationCode,
      name: command.organizationName,
      email: command.organizationEmail,
      status: OrganizationStatus.ACTIVE,
    });

    account.manager.organization = organization;

    this.managerRoleRepository.create({
      manager: account.manager,
      organization,
      role,
    });

    const tokens = await TokenUtil.generateTokens(this.jwtService, account.id, {
      organizationId: organization.id,
      mustChangePassword: false,
      mustCreateOrganization: false,
    });

    await this.redisService.set(
      `refresh:${account.id}`,
      tokens.refreshToken,
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return tokens;
  }
}
