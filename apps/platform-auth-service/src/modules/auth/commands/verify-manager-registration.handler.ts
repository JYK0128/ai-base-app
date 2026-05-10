import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountStatus, ManagerAccountVerificationRepository, ManagerAccountVerificationStatus } from '@pkg/database';

import { VerificationTokenService } from '../services/verification-token.service';

export { VerifyManagerRegistrationCommand } from './verify-manager-registration.handler.helpers';
import { VerifyManagerRegistrationAsserter, VerifyManagerRegistrationCommand } from './verify-manager-registration.handler.helpers';

@CommandHandler(VerifyManagerRegistrationCommand)
export class VerifyManagerRegistrationHandler implements ICommandHandler<VerifyManagerRegistrationCommand> {
  private readonly VerifyGuard = VerifyManagerRegistrationAsserter;

  constructor(
    private readonly verificationRepository: ManagerAccountVerificationRepository,
    private readonly verificationTokenService: VerificationTokenService,
  ) {}

  @Transactional()
  async execute(command: VerifyManagerRegistrationCommand): Promise<void> {
    const verification = await this.VerifyGuard.assert(
      await this.verificationRepository.findOne(
        {
          tokenHash: this.verificationTokenService.hashToken(command.token),
          status: ManagerAccountVerificationStatus.PENDING,
        },
        { populate: ['managerAccount'] },
      ),
      'INVALID_TOKEN',
    );

    if (verification.expiresAt.getTime() < Date.now()) {
      verification.status = ManagerAccountVerificationStatus.EXPIRED;
      await this.VerifyGuard.throwIf(true, 'TOKEN_EXPIRED');
    }

    verification.status = ManagerAccountVerificationStatus.VERIFIED;
    verification.verifiedAt = new Date();
    verification.managerAccount.status = AccountStatus.ACTIVE;
  }
}
