import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { CreateMemberCommand, CreateMemberResponseDto } from './create-member.command';

@CommandHandler(CreateMemberCommand)
export class CreateMemberHandler implements ICommandHandler<CreateMemberCommand> {
  async execute(
    command: CreateMemberCommand,
  ): Promise<CreateMemberResponseDto> {
    const id = randomUUID();
    return { id };
  }
}
