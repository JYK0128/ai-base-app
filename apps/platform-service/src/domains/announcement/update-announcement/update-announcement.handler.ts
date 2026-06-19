import { Transactional } from '@mikro-orm/decorators/legacy';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AnnouncementMetadata } from '@pkg/database';
import { Announcement } from '@pkg/database';
import { JsonbSetQueryBuilder } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { UpdateAnnouncementContract } from './update-announcement.contract';
import { UpdateAnnouncementResponseDto } from './update-announcement.response.dto';

@CommandHandler(UpdateAnnouncementContract)
export class UpdateAnnouncementHandler implements ICommandHandler<UpdateAnnouncementContract> {
  constructor(private readonly cls: ClsService) {}

  @Transactional()
  async execute({ data }: UpdateAnnouncementContract): Promise<UpdateAnnouncementResponseDto> {
    const accountId = this.cls.get<string>('accountId');

    if (!accountId) {
      throw new BadRequestException('REQUEST_CONTEXT_NOT_FOUND');
    }

    const metadataExpression = new JsonbSetQueryBuilder<{ metadata: AnnouncementMetadata }>().build(
      'metadata',
      this.buildAnnouncementMetadataPatch(data),
    );

    const result = await Announcement
      .getQueryBuilder()
      .update({
        title: data.title.trim(),
        content: data.content.trim(),
        updatedAt: new Date(),
        updatedBy: accountId,
        metadata: metadataExpression,
      })
      .where({ id: data.id })
      .execute();

    if (result.affectedRows === 0) {
      throw new NotFoundException('ANNOUNCEMENT_NOT_FOUND');
    }

    return new UpdateAnnouncementResponseDto(data.id);
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
