import { EntityManager } from '@mikro-orm/core';
import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Announcement, CoreRepository, Member } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { AnnouncementResponseDto } from '../get-announcements/get-announcements.response.dto';
import { DeleteAnnouncementContract } from './delete-announcement.contract';

@CommandHandler(DeleteAnnouncementContract)
export class DeleteAnnouncementHandler implements ICommandHandler<DeleteAnnouncementContract> {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Announcement)
    private readonly announcementRepository: CoreRepository<Announcement>,
    @InjectRepository(Member)
    private readonly memberRepository: CoreRepository<Member>,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute({ data }: DeleteAnnouncementContract): Promise<AnnouncementResponseDto> {
    const announcement = await this.announcementRepository.findOne({ id: data.id });

    if (!announcement) {
      throw new NotFoundException('ANNOUNCEMENT_NOT_FOUND');
    }

    const author = await this.identifyAuthor();
    announcement.updatedAt = new Date();
    announcement.updatedBy = author.name;

    const response = new AnnouncementResponseDto(announcement);
    announcement.remove();

    return response;
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
}
