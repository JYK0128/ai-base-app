import { Activity, FileText, Globe2, Settings2, Users } from 'lucide-react';

export type OrganizationTab = 'overview' | 'activity';

export interface OrganizationIdentityMock {
  name: string
  email: string
  createdAt: string
}

export interface OrganizationActivityMock {
  title: string
  description: string
  when: string
  icon: typeof Activity
  tone: 'emerald' | 'sky' | 'amber' | 'slate'
}

export const MOCK_ORGANIZATION: OrganizationIdentityMock = {
  name: '아이베이스 플랫폼',
  email: 'owner@ibase.example',
  createdAt: '2026. 03. 14 09:30',
};

export const MOCK_ACTIVITY: OrganizationActivityMock[] = [
  {
    title: '서브도메인 연결 완료',
    description: 'platform.ibase.example 도메인이 조직에 연결되었습니다.',
    when: '오늘 09:42',
    icon: Globe2,
    tone: 'sky',
  },
  {
    title: '새 멤버 합류',
    description: '한도윤 님이 멤버로 등록되었습니다.',
    when: '어제 18:34',
    icon: Users,
    tone: 'emerald',
  },
  {
    title: '접속 정책 갱신',
    description: '조직 접속 정책이 최신 값으로 정리되었습니다.',
    when: '2026. 05. 20',
    icon: FileText,
    tone: 'amber',
  },
  {
    title: '운영 설정 검토',
    description: '운영 설정이 최신 값으로 정리되었습니다.',
    when: '2026. 05. 18',
    icon: Settings2,
    tone: 'slate',
  },
];
