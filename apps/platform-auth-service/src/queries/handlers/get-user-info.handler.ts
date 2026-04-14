import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUserInfoQuery } from '../impl/get-user-info.query';

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  private readonly logger = new Logger(GetUserInfoHandler.name);

  async execute(query: GetUserInfoQuery) {
    const { userId } = query;
    this.logger.log(`Executing GetUserInfoQuery for user: ${userId}`);

    // Mock DB fetch
    return {
      id: userId,
      username: 'johndoe',
      roles: ['admin', 'user'],
      createdAt: new Date().toISOString(),
    };
  }
}
