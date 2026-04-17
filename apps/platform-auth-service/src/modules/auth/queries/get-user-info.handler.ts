import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ManagerAccountRepository, UserAccountRepository } from '@pkg/database';

export class GetUserInfoQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly userAccountRepository: UserAccountRepository,
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
