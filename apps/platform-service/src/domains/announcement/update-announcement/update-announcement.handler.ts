import { EntityManager } from '@mikro-orm/core';
import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementMetadata, AnnouncementPriority, CoreRepository, Member } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { UpdateAnnouncementResponseDto } from '../get-announcements/get-announcements.response.dto';
import { UpdateAnnouncementContract } from './update-announcement.contract';
import type { UpdateAnnouncementRequestDto } from './update-announcement.request.dto';

@CommandHandler(UpdateAnnouncementContract)
export class UpdateAnnouncementHandler implements ICommandHandler<UpdateAnnouncementContract> {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Announcement)
    private readonly announcementRepository: CoreRepository<Announcement>,
    @InjectRepository(Member)
    private readonly memberRepository: CoreRepository<Member>,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute({ announcementId, data }: UpdateAnnouncementContract): Promise<UpdateAnnouncementResponseDto> {
    const announcement = await this.identifyAnnouncement(announcementId);
    const author = await this.identifyAuthor();

    this.applyMutation(announcement, data, author);

    return new UpdateAnnouncementResponseDto(announcement);
  }

  private async identifyAuthor(): Promise<Member> {
    const memberId = this.cls.get('memberId');

    if (!memberId) {
      throw new BadRequestException('REQUEST_CONTEXT_NOT_FOUND');
    }

    const member = await this.memberRepository.findOne({ id: memberId });

    if (!member) {
      throw new NotFoundException('MEMBER_NOT_FOUND');
    }

    return member;
  }

  private async identifyAnnouncement(id: string): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({ id });

    if (!announcement) {
      throw new NotFoundException('ANNOUNCEMENT_NOT_FOUND');
    }

    return announcement;
  }

  private applyMutation(
    announcement: Announcement,
    data: UpdateAnnouncementRequestDto,
    author: Member,
  ): void {
    const now = new Date();
    const metadata = announcement.metadata ?? new AnnouncementMetadata();

    announcement.title = data.title.trim();
    announcement.content = data.content.trim();
    announcement.updatedAt = now;
    announcement.updatedBy = author.name;

    metadata.category = data.category ?? metadata.category ?? AnnouncementCategory.NOTICE;
    metadata.audience = data.audience ?? metadata.audience ?? AnnouncementAudience.ORGANIZATION;
    metadata.channel = data.channel ?? metadata.channel ?? AnnouncementChannel.IN_APP;
    metadata.priority = data.priority ?? metadata.priority ?? AnnouncementPriority.NORMAL;
    metadata.pinned = Boolean(data.pinned ?? metadata.pinned ?? false);

    const isPublished = data.isPublished ?? (data.publishedAt ? true : Boolean(metadata.publishedAt));
    if (isPublished) {
      metadata.publishedAt = this.resolvePublishedAt(data, metadata, now);
    }

    metadata.startAt = data.startAt ? new Date(data.startAt) : metadata.startAt;
    metadata.endAt = data.endAt ? new Date(data.endAt) : metadata.endAt;

    announcement.metadata = metadata;
  }

  private resolvePublishedAt(
    data: UpdateAnnouncementRequestDto,
    metadata: AnnouncementMetadata,
    fallback: Date,
  ): Date {
    if (data.publishedAt) {
      const publishedAt = new Date(data.publishedAt);
      if (!Number.isNaN(publishedAt.getTime())) {
        return publishedAt;
      }
    }

    if (metadata.publishedAt) {
      return metadata.publishedAt;
    }

    return fallback;
  }
}
