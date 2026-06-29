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
    const metadataExpression = new JsonbSetQueryBuilder<{ metadata: AnnouncementMetadata }>().build(
      'metadata',
      this.buildAnnouncementMetadataPatch(command.data),
    );

    const result = await Announcement
      .getQueryBuilder()
      .update({
        title: command.data.title.trim(),
        content: command.data.content.trim(),
        updatedAt: new Date(),
        updatedBy: account.id,
        metadata: metadataExpression,
      })
      .where({ id: command.data.id })
      .execute();

    if (result.affectedRows === 0) {
      throw new NotFoundException('ANNOUNCEMENT_NOT_FOUND');
    }

    return new UpdateAnnouncementResponseDto(command.data.id);
  }

  private buildAnnouncementMetadataPatch(
    data: UpdateAnnouncementContract['data'],
  ): Partial<AnnouncementMetadata> {
    const patch: Partial<AnnouncementMetadata> = {};

    if (data.category !== undefined) {
      patch.category = data.category;
    }

    if (data.audience !== undefined) {
      patch.audience = data.audience;
    }

    if (data.channel !== undefined) {
      patch.channel = data.channel;
    }

    if (data.priority !== undefined) {
      patch.priority = data.priority;
    }

    if (data.pinned !== undefined) {
      patch.pinned = data.pinned;
    }

    if (data.publishedAt !== undefined) {
      patch.publishedAt = new Date(data.publishedAt);
    }
    else if (data.isPublished === true) {
      patch.publishedAt = new Date();
    }
    else if (data.isPublished === false) {
      patch.publishedAt = null;
    }

    if (data.startAt !== undefined) {
      patch.startAt = new Date(data.startAt);
    }

    if (data.endAt !== undefined) {
      patch.endAt = new Date(data.endAt);
    }

    return patch;
  }
}
