import type { AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementPriority } from '@pkg/database';

export type { AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementPriority } from '@pkg/database';

export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED';

export interface AnnouncementInput {
  id?: string
  title: string
  content: string
  category?: AnnouncementCategory
  audience?: AnnouncementAudience
  channel?: AnnouncementChannel
  priority?: AnnouncementPriority
  pinned?: boolean
  publishedAt?: string
  startAt?: string
  endAt?: string
}

export interface AnnouncementRecordMetadata {
  category: AnnouncementCategory
  audience: AnnouncementAudience
  channel: AnnouncementChannel
  priority: AnnouncementPriority
  pinned: boolean
  publishedAt: string
  startAt: string
  endAt: string
}

export interface AnnouncementRecord {
  id: string
  title: string
  summary: string
  content: string
  category: AnnouncementCategory
  audience: AnnouncementAudience
  channel: AnnouncementChannel
  priority: AnnouncementPriority
  status: AnnouncementStatus
  isPublished: boolean
  pinned: boolean
  author: string
  publishedAt: string
  startAt: string
  endAt: string
  createdAt: string
  updatedAt: string
}
