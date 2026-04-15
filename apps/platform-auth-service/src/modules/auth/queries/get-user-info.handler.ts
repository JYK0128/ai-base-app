/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { InjectRepository } from '@mikro-orm/nestjs';
import type { EntityRepository } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ManagerAccount } from '@pkg/database/src/domains/manager/manager.account.entity';
import { UserAccount } from '@pkg/database/src/domains/site/user.account.entity';

export class GetUserInfoQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(
    @InjectRepository(ManagerAccount)
    private readonly managerAccountRepository: EntityRepository<ManagerAccount>,
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: EntityRepository<UserAccount>,
  ) {}

  async execute(query: GetUserInfoQuery) {
    const { userId } = query;

    const managerAccount = await this.managerAccountRepository.findOne({ id: userId });
    if (managerAccount) {
      return {
        userId: managerAccount.id,
        email: managerAccount.email,
        accountType: 'manager' as const,
      };
    }

    const userAccount = await this.userAccountRepository.findOne({ id: userId });
    if (userAccount) {
      return {
        userId: userAccount.id,
        email: userAccount.email,
        accountType: 'user' as const,
      };
    }

    throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
  }
}
