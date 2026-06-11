import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, Resource, ResourceScope } from '@pkg/database';

import { CreateResourceCommand } from './create-resource.command';
import { CreateResourceAsserter } from './create-resource.error';

@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler implements ICommandHandler<CreateResourceCommand> {
  private readonly Asserter = CreateResourceAsserter;

  constructor(
    private readonly resourceRepo: CoreRepository<Resource>,
  ) {}

  @Transactional()
  async execute(command: CreateResourceCommand): Promise<{ id: string }> {
    await this.validateNoDuplicate(command.code);
    const parent = await this.identifyParent(command.parentId);
    return this.processResourceCreation(command, parent);
  }

  /** 중복 코드 검증 */
  private async validateNoDuplicate(code: string): Promise<void> {
    const existing = await this.resourceRepo.findOne({ code });
    await this.Asserter.throwIf(!!existing, 'ALREADY_EXISTS');
  }

  /** 상위 플랫폼 리소스 조회 (없으면 undefined 허용) */
  private async identifyParent(parentId?: string): Promise<Resource | undefined> {
    if (!parentId) return undefined;
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id: parentId }),
      'PARENT_NOT_FOUND',
    );
  }

  /** 플랫폼 리소스 생성 */
  private processResourceCreation(
    command: CreateResourceCommand,
    parent: Resource | undefined,
  ): { id: string } {
    const resource = this.resourceRepo.create({
      code: command.code,
      name: command.name,
      type: command.type,
      scope: ResourceScope.PLATFORM,
      path: command.path,
      parent,
      actions: [],
    });

    return { id: resource.id };
  }
}
