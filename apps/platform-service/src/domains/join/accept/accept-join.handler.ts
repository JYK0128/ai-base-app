import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Member, MemberAccount, MemberInvite, MemberInviteStatus, OrganizationRoleAssignment } from '@pkg/database';

import { ENV } from '@/env';

import { createTermsConsents, findJoinRequiredTerms, type JoinRequiredTerm } from '../join-terms.helper';
import { AcceptJoinContract } from './accept-join.contract';
import { AcceptJoinAsserter } from './accept-join.error';
import { AcceptJoinResponseDto } from './accept-join.response.dto';

@CommandHandler(AcceptJoinContract)
export class AcceptJoinHandler implements ICommandHandler<AcceptJoinContract> {
  private readonly Asserter = AcceptJoinAsserter;

  @Transactional()
  async execute(command: AcceptJoinContract): Promise<AcceptJoinResponseDto> {
    const invite = await this.identifyInvite(command);
    const terms = await findJoinRequiredTerms(invite.organization.id);

    await this.verifyJoinable(command, invite, terms);
    return this.process(command, invite, terms);
  }

  private async identifyInvite(command: AcceptJoinContract): Promise<MemberInvite> {
    return this.Asserter.assert(
      MemberInvite.findOne(
        { token: command.data.token },
        { populate: ['organization', 'role'] },
      ),
      'INVITE_NOT_FOUND',
    );
  }

  private async verifyJoinable(
    command: AcceptJoinContract,
    invite: MemberInvite,
    terms: JoinRequiredTerm[],
  ): Promise<void> {
    if (invite.status !== MemberInviteStatus.QUEUED && invite.status !== MemberInviteStatus.PENDING) {
      await this.Asserter.throw('INVITE_NOT_AVAILABLE');
    }

    await this.Asserter.throwIf(command.data.profile.email !== invite.email, 'EMAIL_MISMATCH');

    const account = await MemberAccount.findOne({ email: invite.email });

    await this.Asserter.throwIf(!!account, 'ACCOUNT_ALREADY_EXISTS');
    await this.verifyTerms(command, terms);
  }

  private async verifyTerms(command: AcceptJoinContract, terms: JoinRequiredTerm[]): Promise<void> {
    const activeTermIds = new Set(terms.map((term) => term.versionId));
    const agreedTermIds = new Set(
      command.data.terms
        .filter((term) => term.agreed)
        .map((term) => term.termsVersionId),
    );

    const hasInvalidTerm = command.data.terms.some((term) => !activeTermIds.has(term.termsVersionId));
    await this.Asserter.throwIf(hasInvalidTerm, 'INVALID_TERMS');

    const hasRequiredTermNotAgreed = terms.some((term) => term.required && !agreedTermIds.has(term.versionId));
    await this.Asserter.throwIf(hasRequiredTermNotAgreed, 'REQUIRED_TERMS_NOT_AGREED');
  }

  private async process(
    command: AcceptJoinContract,
    invite: MemberInvite,
    _terms: JoinRequiredTerm[],
  ): Promise<AcceptJoinResponseDto> {
    const member = Member.create({
      organization: invite.organization,
      name: command.data.profile.name,
      email: invite.email,
      metadata: null,
    });
    const account = MemberAccount.create({
      member,
      email: invite.email,
      password: '',
      passwordExpiresAt: new Date(),
      metadata: null,
    });
    account.updatePassword(command.data.profile.password, ENV.PASSWORD_EXPIRY_DAYS);

    OrganizationRoleAssignment.create({
      member,
      organization: invite.organization,
      role: invite.role,
      metadata: null,
    });
    createTermsConsents(member.id, command.data.terms);

    invite.metadata.acceptedAt = new Date();

    return new AcceptJoinResponseDto({
      memberId: member.id,
      accountId: account.id,
      inviteId: invite.id,
    });
  }
}
