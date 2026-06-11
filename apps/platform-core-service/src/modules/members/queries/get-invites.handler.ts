import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MemberInvite, Organization, OrganizationRole } from '@pkg/database';
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
    const organization = await this.identifyOrganization();
    const invites = await this.loadInvites(organization, payload);

    return invites.map((invite) => buildInviteRecord(invite));
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organizationId);
  }

  private async loadInvites(organization: Organization, payload: GetInvitesQuery['payload']): Promise<MemberInvite[]> {
    const role = payload.roleId
      ? OrganizationRole.getReference(payload.roleId)
      : undefined;

    const invites = await this.Asserter.assert(
      MemberInvite.find(
        {
          organization,
          status: payload.inviteStatus,
          role,
        },
        {
          populate: ['role'],
          orderBy: { createdAt: 'DESC' },
        },
      ),
      'LOAD_FAILED',
    );

    const search = payload.search?.trim().toLowerCase();

    if (!search) {
      return invites;
    }

    return invites.filter((invite) => {
      const searchTargets = [
        invite.name,
        invite.email,
        invite.role.name,
        invite.role.code,
        invite.metadata?.info?.note ?? '',
      ].join(' ').toLowerCase();

      return searchTargets.includes(search);
    });
  }
}
