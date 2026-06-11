import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { MemberRecord } from '../members.contract';
import { buildMemberRecord } from '../members.helper';
import { GetMembersAsserter } from './get-members.error';
import { GetMembersQuery } from './get-members.query';

@QueryHandler(GetMembersQuery)
export class GetMembersHandler implements IQueryHandler<GetMembersQuery> {
  private readonly Asserter = GetMembersAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ payload }: GetMembersQuery): Promise<MemberRecord[]> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    const organization = await this.Asserter.assert(
      Organization.findOne({ id: organizationId }),
      'ORGANIZATION_NOT_FOUND',
    );

    const loadedMembers = await this.Asserter.assert(
      Member.find(
        { organization },
        {
          populate: ['accounts', 'organizationRoles.role', 'organizationRoles.organization'],
          orderBy: { createdAt: 'DESC' },
        },
      ),
      'LOAD_FAILED',
    );

    const search = payload.search?.trim().toLowerCase();
    const status = payload.status;
    const roleValue = (payload as { roleId?: string, role?: string }).roleId
      ?? (payload as { role?: string }).role;

    return loadedMembers
      .filter((member) => {
        if (status && member.status !== status) {
          return false;
        }

        const organizationRoles = member.organizationRoles.getItems();

        if (roleValue) {
          const hasMatchedRole = organizationRoles.some((assignment) => (
            assignment.role.id === roleValue
            || assignment.role.code === roleValue
          ));

          if (!hasMatchedRole) {
            return false;
          }
        }

        if (!search) {
          return true;
        }

        const accountItems = member.accounts.getItems();
        const searchTargets = [
          member.name,
          member.createdBy ?? '',
          ...accountItems.map((account) => account.email),
          ...organizationRoles.map((assignment) => assignment.role.code),
          ...organizationRoles.map((assignment) => assignment.role.name),
        ].join(' ').toLowerCase();

        return searchTargets.includes(search);
      })
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map((member) => buildMemberRecord(member));
  }
}
