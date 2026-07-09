import { Transactional } from '@mikro-orm/decorators/legacy';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AnnouncementMetadata } from '@pkg/database';
import { Announcement } from '@pkg/database';
import type { AuthAccountContext } from '@pkg/shared/server';
import { JsonbSetQueryBuilder } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { UpdateAnnouncementContract } from './update-announcement.contract';
import { UpdateAnnouncementResponseDto } from './update-announcement.response.dto';

@CommandHandler(UpdateAnnouncementContract)
export class UpdateAnnouncementHandler implements ICommandHandler<UpdateAnnouncementContract> {
  constructor(private readonly cls: ClsService) {}

  @Transactional()
  async execute(command: UpdateAnnouncementContract): Promise<UpdateAnnouncementResponseDto> {
    const account = this.identifyRequestAccount();
    this.verifyUpdate(command, account);
    return await this.processUpdate(command, account);
  }

  private identifyRequestAccount(): AuthAccountContext {
    const account = this.cls.get<AuthAccountContext>('account');
    if (!account) {
      throw new BadRequestException('REQUEST_CONTEXT_NOT_FOUND');
    }

    return account;
  }

  private verifyUpdate(_command: UpdateAnnouncementContract, _account: AuthAccountContext): void {
    // 공지 수정 정책 검증 영역
  }

  private async processUpdate(
    command: UpdateAnnouncementContract,
    account: AuthAccountContext,
  ): Promise<UpdateAnnouncementResponseDto> {
    const announcement = await Announcement.findOne({ id: command.data.id });

    if (!announcement) {
      throw new NotFoundException('ANNOUNCEMENT_NOT_FOUND');
    }

    const metadataPatch: Partial<AnnouncementMetadata> = {};
    if (command.data.publishedAt !== undefined) {
      metadataPatch.publishedAt = command.data.publishedAt;
    }
    if (command.data.startAt !== undefined) {
      metadataPatch.startAt = command.data.startAt;
    }
    if (command.data.endAt !== undefined) {
      metadataPatch.endAt = command.data.endAt;
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: account.id,
    };

    if (command.data.title !== undefined) {
      updates.title = command.data.title.trim();
    }
    if (command.data.content !== undefined) {
      updates.content = command.data.content.trim();
    }
    if (command.data.category !== undefined) {
      updates.category = command.data.category;
    }
    if (command.data.audience !== undefined) {
      updates.audience = command.data.audience;
    }
    if (command.data.priority !== undefined) {
      updates.priority = command.data.priority;
    }
    if (command.data.pinned !== undefined) {
      updates.pinned = command.data.pinned;
    }
    if (Object.keys(metadataPatch).length > 0) {
      updates.metadata = new JsonbSetQueryBuilder<{ metadata: AnnouncementMetadata }>().build('metadata', metadataPatch);
    }

    const result = await Announcement
      .getQueryBuilder()
      .update(updates)
      .where({ id: command.data.id })
      .execute();

    if (result.affectedRows === 0) {
      throw new NotFoundException('ANNOUNCEMENT_NOT_FOUND');
    }

    return new UpdateAnnouncementResponseDto(command.data.id);
  }
}
