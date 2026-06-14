import { EntityManager } from '@mikro-orm/core';
import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementMetadata, AnnouncementPriority, CoreRepository, Member } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { AnnouncementResponseDto } from '../get-announcements/get-announcements.response.dto';
import { SaveAnnouncementContract } from './save-announcement.contract';
import type { SaveAnnouncementRequestDto } from './save-announcement.request.dto';

@CommandHandler(SaveAnnouncementContract)
export class SaveAnnouncementHandler implements ICommandHandler<SaveAnnouncementContract> {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Announcement)
    private readonly announcementRepository: CoreRepository<Announcement>,
    @InjectRepository(Member)
    private readonly memberRepository: CoreRepository<Member>,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute({ data }: SaveAnnouncementContract): Promise<AnnouncementResponseDto> {
    const author = await this.identifyAuthor();
    const announcement = data.id
      ? await this.identifyAnnouncement(data.id)
      : this.announcementRepository.create({
        title: data.title.trim(),
        content: data.content.trim(),
        metadata: new AnnouncementMetadata(),
      });

    this.applyMutation(announcement, data, author);

    return new AnnouncementResponseDto(announcement);
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
    data: SaveAnnouncementRequestDto,
    author: Member,
  ): void {
    const now = new Date();
    const metadata = announcement.metadata ?? new AnnouncementMetadata();

    announcement.title = data.title.trim();
    announcement.content = data.content.trim();
    announcement.createdBy = announcement.createdBy ?? author.name;
    announcement.updatedAt = now;
    announcement.updatedBy = author.name;

    metadata.category = data.category ?? metadata.category ?? AnnouncementCategory.NOTICE;
    metadata.audience = data.audience ?? metadata.audience ?? AnnouncementAudience.ORGANIZATION;
    metadata.channel = data.channel ?? metadata.channel ?? AnnouncementChannel.IN_APP;
    metadata.priority = data.priority ?? metadata.priority ?? AnnouncementPriority.NORMAL;
    metadata.pinned = Boolean(data.pinned ?? metadata.pinned ?? false);

    const isPublished = data.isPublished ?? (data.publishedAt ? true : Boolean(metadata.publishedAt));
    metadata.publishedAt = isPublished
      ? this.resolvePublishedAt(data, metadata, now)
      : undefined;

    metadata.startAt = data.startAt ? new Date(data.startAt) : metadata.startAt;
    metadata.endAt = data.endAt ? new Date(data.endAt) : metadata.endAt;

    announcement.metadata = metadata;
  }

  private resolvePublishedAt(
    data: SaveAnnouncementRequestDto,
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
