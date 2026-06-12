import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreateMemberCommand, CreateMemberRequestDto, CreateMemberResponseDto } from './create-member.command';

export const CREATE_MEMBER_PATTERN = 'members.create';

@Controller()
export class CreateMemberController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(CREATE_MEMBER_PATTERN)
  async createMember(
    @Payload() data: CreateMemberRequestDto,
  ) {
    return this.commandBus.execute<
      CreateMemberCommand,
      CreateMemberResponseDto
    >(new CreateMemberCommand(data));
  }
}
