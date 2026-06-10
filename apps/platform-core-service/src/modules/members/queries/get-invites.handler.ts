import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MemberInvite, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { InviteRecord } from '../members.contract';
import { buildInviteRecord } from '../members.helper';
import { GetInvitesAsserter } from './get-invites.error';
import { GetInvitesQuery } from './get-invites.query';

@QueryHandler(GetInvitesQuery)
export class GetInvitesHandler implements IQueryHandler<GetInvitesQuery> {
  private readonly Asserter = GetInvitesAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ payload }: GetInvitesQuery): Promise<InviteRecord[]> {
    // TODO: payload 무엇을 의미하는지 조사
    const { inviteStatus, role, search } = payload;
    const organization = await this.identifyOrganization();
    const invites = await this.loadInvites(organization);

    return invites.map((invite) => buildInviteRecord(invite));
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organizationId);
  }

  private async loadInvites(organization: Organization): Promise<MemberInvite[]> {
    return await this.Asserter.assert(
      MemberInvite.find(
        { organization },
        {
          populate: ['role'],
          orderBy: { createdAt: 'DESC' },
        },
      ),
      'LOAD_FAILED',
    );
  }
}
