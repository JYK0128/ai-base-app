import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetUserInfoQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  async execute(query: GetUserInfoQuery) {
    const { userId } = query;
    // Mock user data
    return {
      userId,
      username: `user_${userId}`,
      email: `${userId}@example.com`,
    };
  }
}
