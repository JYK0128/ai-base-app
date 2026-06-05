export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED';

export type AnnouncementCategory = 'NOTICE' | 'MAINTENANCE' | 'SECURITY' | 'EVENT';

export type AnnouncementAudience = 'ALL' | 'PLATFORM' | 'ORGANIZATION';

export type AnnouncementChannel = 'IN_APP' | 'EMAIL' | 'PUSH';

export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface AnnouncementInput {
  id?: string
  title: string
  content: string
  category?: AnnouncementCategory
  audience?: AnnouncementAudience
  channel?: AnnouncementChannel
  priority?: AnnouncementPriority
  status?: AnnouncementStatus
  isPublished?: boolean
  pinned?: boolean
  startAt?: string
  endAt?: string
}

export interface AnnouncementMetadata {
  category: AnnouncementCategory
  audience: AnnouncementAudience
  channel: AnnouncementChannel
  priority: AnnouncementPriority
  pinned: boolean
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
  startAt: string
  endAt: string
  createdAt: string
  updatedAt: string
}
