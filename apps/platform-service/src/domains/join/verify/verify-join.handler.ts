import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MemberAccount, MemberInvite, MemberInviteStatus } from '@pkg/database';

import { findJoinRequiredTerms } from '../join-terms.helper';
import { VerifyJoinContract } from './verify-join.contract';
import { VerifyJoinAsserter } from './verify-join.error';
import { VerifyJoinResponseDto } from './verify-join.response.dto';

@QueryHandler(VerifyJoinContract)
export class VerifyJoinHandler implements IQueryHandler<VerifyJoinContract> {
  private readonly Asserter = VerifyJoinAsserter;

  async execute(query: VerifyJoinContract): Promise<VerifyJoinResponseDto> {
    const invite = await this.identifyInvite(query);
    await this.verifyJoinable(invite);
    return this.process(query, invite);
  }

  private async identifyInvite(query: VerifyJoinContract): Promise<MemberInvite> {
    return this.Asserter.assert(
      MemberInvite.findOne(
        { token: query.data.token },
        { populate: ['organization', 'role'] },
      ),
      'INVITE_NOT_FOUND',
    );
  }

  private async verifyJoinable(invite: MemberInvite): Promise<void> {
    if (invite.status !== MemberInviteStatus.QUEUED && invite.status !== MemberInviteStatus.PENDING) {
      await this.Asserter.throw('INVITE_NOT_AVAILABLE');
    }

    const account = await MemberAccount.findOne({ email: invite.email });

    await this.Asserter.throwIf(!!account, 'ACCOUNT_ALREADY_EXISTS');
  }

  private async process(_query: VerifyJoinContract, invite: MemberInvite): Promise<VerifyJoinResponseDto> {
    const terms = await findJoinRequiredTerms(invite.organization.id);
    return new VerifyJoinResponseDto(invite, terms);
  }
}
