import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
  Label,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';
import {
  Ban,
  CheckCircle2,
  CircleX,
  Lock,
  Mail,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Shield,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, type ReactNode, useState } from 'react';

export const Route = createFileRoute('/_protected/members/index/backup')({
  component: MembersPage,
});

type PreviewMode = 'list' | 'loading' | 'empty' | 'restricted';
type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_INVITE';
type InviteStatus = 'ACCEPTED' | 'PENDING' | 'EXPIRED' | 'CANCELED';
type MemberRole = 'OWNER' | 'MANAGER' | 'MEMBER';

interface MemberMock {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
  inviteStatus: InviteStatus
  lastLoginAt: string | null
  invitedAt: string
  invitedBy: string
  note?: string
  isMe?: boolean
}

interface InviteDraft {
  name: string
  email: string
  role: MemberRole
  note: string
}

interface RoleOption {
  value: MemberRole
  label: string
  badgeClassName: string
}

interface PreviewOption {
  value: PreviewMode
  label: string
  description: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'OWNER',
    label: 'Owner',
    badgeClassName: 'border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100',
  },
  {
    value: 'MANAGER',
    label: 'Manager',
    badgeClassName: 'border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  {
    value: 'MEMBER',
    label: 'Member',
    badgeClassName: 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
];

const PREVIEW_OPTIONS: PreviewOption[] = [
  { value: 'list', label: '목록', description: '실제 멤버 테이블' },
  { value: 'loading', label: '로딩', description: '스켈레톤 확인' },
  { value: 'empty', label: '빈 상태', description: '데이터 없음 화면' },
  { value: 'restricted', label: '권한 없음', description: '접근 제한 화면' },
];

const INITIAL_MEMBERS: MemberMock[] = [
  {
    id: 'member-001',
    name: 'Admin User',
    email: 'admin@platform.com',
    role: 'OWNER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-23 08:42',
    invitedAt: '2026-01-04 09:00',
    invitedBy: 'system',
    note: '현재 로그인 계정',
    isMe: true,
  },
  {
    id: 'member-002',
    name: 'Mina Park',
    email: 'manager@platform.com',
    role: 'OWNER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-22 15:40',
    invitedAt: '2026-02-12 14:20',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-003',
    name: 'Jinwoo Kim',
    email: 'ops@platform.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-22 09:15',
    invitedAt: '2026-03-08 10:10',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-004',
    name: 'Sora Lee',
    email: 'viewer@platform.com',
    role: 'MEMBER',
    status: 'INACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-18 10:02',
    invitedAt: '2026-03-18 09:25',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-005',
    name: 'New Joiner',
    email: 'new.joiner@platform.com',
    role: 'MANAGER',
    status: 'PENDING_INVITE',
    inviteStatus: 'PENDING',
    lastLoginAt: null,
    invitedAt: '2026-05-23 08:30',
    invitedBy: 'admin@platform.com',
    note: '신규 초대',
  },
  {
    id: 'member-006',
    name: 'Freelancer',
    email: 'freelance@platform.com',
    role: 'MEMBER',
    status: 'PENDING_INVITE',
    inviteStatus: 'EXPIRED',
    lastLoginAt: null,
    invitedAt: '2026-05-20 14:00',
    invitedBy: 'admin@platform.com',
    note: '초대 만료',
  },
  {
    id: 'member-007',
    name: 'Temp Operator',
    email: 'temp@platform.com',
    role: 'MEMBER',
    status: 'INACTIVE',
    inviteStatus: 'CANCELED',
    lastLoginAt: '2026-04-28 16:30',
    invitedAt: '2026-04-10 09:00',
    invitedBy: 'admin@platform.com',
    note: '초대 취소됨',
  },
  {
    id: 'member-008',
    name: 'Hana Lee',
    email: 'hana.lee@platform.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-23 07:55',
    invitedAt: '2026-04-02 11:20',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-009',
    name: 'Kevin Choi',
    email: 'kevin.choi@platform.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-21 18:05',
    invitedAt: '2026-04-07 13:40',
    invitedBy: 'manager@platform.com',
  },
  {
    id: 'member-010',
    name: 'Jisoo Kim',
    email: 'jisoo.kim@platform.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-20 11:50',
    invitedAt: '2026-04-11 09:15',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-011',
    name: 'Daehoon Park',
    email: 'daehoon.park@platform.com',
    role: 'MEMBER',
    status: 'INACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-08 16:22',
    invitedAt: '2026-04-15 10:30',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-012',
    name: 'Seoyeon Jung',
    email: 'seoyeon.jung@platform.com',
    role: 'MEMBER',
    status: 'PENDING_INVITE',
    inviteStatus: 'PENDING',
    lastLoginAt: null,
    invitedAt: '2026-05-23 09:10',
    invitedBy: 'admin@platform.com',
    note: '개발팀 신규 합류',
  },
  {
    id: 'member-013',
    name: 'Minseok Yoo',
    email: 'minseok.yoo@platform.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-23 06:40',
    invitedAt: '2026-03-27 15:00',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-014',
    name: 'Eunji Han',
    email: 'eunji.han@platform.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-19 14:33',
    invitedAt: '2026-04-20 12:10',
    invitedBy: 'manager@platform.com',
  },
  {
    id: 'member-015',
    name: 'Sungmin Lim',
    email: 'sungmin.lim@platform.com',
    role: 'MEMBER',
    status: 'INACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-02 09:48',
    invitedAt: '2026-04-25 08:45',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-016',
    name: 'Yerin Oh',
    email: 'yerin.oh@platform.com',
    role: 'MANAGER',
    status: 'PENDING_INVITE',
    inviteStatus: 'EXPIRED',
    lastLoginAt: null,
    invitedAt: '2026-05-18 17:20',
    invitedBy: 'admin@platform.com',
    note: '만료된 초대',
  },
  {
    id: 'member-017',
    name: 'Junseo Kang',
    email: 'junseo.kang@platform.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-22 20:11',
    invitedAt: '2026-05-01 09:05',
    invitedBy: 'manager@platform.com',
  },
  {
    id: 'member-018',
    name: 'Nari Shin',
    email: 'nari.shin@platform.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-23 10:02',
    invitedAt: '2026-04-29 11:55',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-019',
    name: 'Hyunwoo Jeon',
    email: 'hyunwoo.jeon@platform.com',
    role: 'MANAGER',
    status: 'INACTIVE',
    inviteStatus: 'ACCEPTED',
    lastLoginAt: '2026-05-11 13:27',
    invitedAt: '2026-03-30 10:35',
    invitedBy: 'admin@platform.com',
  },
  {
    id: 'member-020',
    name: 'Grace Chae',
    email: 'grace.chae@platform.com',
    role: 'MEMBER',
    status: 'PENDING_INVITE',
    inviteStatus: 'PENDING',
    lastLoginAt: null,
    invitedAt: '2026-05-23 10:45',
    invitedBy: 'admin@platform.com',
    note: '디자인팀 대기 중',
  },
];

function MembersPage() {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MemberStatus>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | MemberRole>('ALL');
  const [members, setMembers] = useState<MemberMock[]>(INITIAL_MEMBERS);
  const [inviteDraft, setInviteDraft] = useState<InviteDraft>({
    name: '',
    email: '',
    role: 'MANAGER',
    note: '',
  });

  const totalCount = members.length;
  const activeCount = members.filter((member) => member.status === 'ACTIVE').length;
  const pendingInviteCount = members.filter((member) => member.status === 'PENDING_INVITE').length;

  const filteredMembers = members.filter((member) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query
      || member.name.toLowerCase().includes(query)
      || member.email.toLowerCase().includes(query)
      || member.role.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
  };

  const updateMemberRole = (memberId: string, nextRole: MemberRole) => {
    setMembers((current) =>
      current.map((member) => (member.id === memberId ? { ...member, role: nextRole } : member)),
    );
  };

  const toggleMemberStatus = (memberId: string) => {
    setMembers((current) =>
      current.map((member) => {
        if (member.id !== memberId || member.status === 'PENDING_INVITE') return member;

        const nextStatus: MemberStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return {
          ...member,
          status: nextStatus,
        };
      }),
    );
  };

  const resendInvite = (memberId: string) => {
    setMembers((current) =>
      current.map((member) => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          status: 'PENDING_INVITE',
          inviteStatus: 'PENDING',
          invitedAt: '2026-05-23 11:30',
        };
      }),
    );
  };

  const cancelInvite = (memberId: string) => {
    setMembers((current) =>
      current.map((member) => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          status: 'INACTIVE',
          inviteStatus: 'CANCELED',
        };
      }),
    );
  };

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = inviteDraft.email.trim().toLowerCase();
    if (!email) return;

    const displayName = inviteDraft.name.trim() || email.split('@')[0] || 'New Member';

    setMembers((current) => {
      if (current.some((member) => member.email.toLowerCase() === email)) {
        return current;
      }

      return [
        {
          id: `member-${Date.now()}`,
          name: displayName,
          email,
          role: inviteDraft.role,
          status: 'PENDING_INVITE',
          inviteStatus: 'PENDING',
          lastLoginAt: null,
          invitedAt: '2026-05-23 12:00',
          invitedBy: 'admin@platform.com',
          note: inviteDraft.note.trim() || undefined,
        },
        ...current,
      ];
    });

    setInviteDraft({
      name: '',
      email: '',
      role: 'MANAGER',
      note: '',
    });
    setPreviewMode('list');
  };

  const handleRefresh = () => {
    setPreviewMode('loading');
    setTimeout(() => {
      setPreviewMode('list');
    }, 500);
  };

  const renderMainState = () => {
    if (previewMode === 'restricted') {
      return (
        <Empty className="min-h-[540px] border border-dashed border-slate-200 bg-slate-50/70">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-rose-50 text-rose-600">
              <Lock className="size-4" />
            </EmptyMedia>
            <EmptyTitle>멤버 관리 권한이 없습니다</EmptyTitle>
            <EmptyDescription>
              이 화면은 `MEMBER:READ` 권한이 있을 때만 표시됩니다.
              Owner 또는 Manager에게 권한 부여를 요청하거나, 계정 티어를 확인해 주세요.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => setPreviewMode('list')}>
              목록 보기로 돌아가기
            </Button>
          </EmptyContent>
        </Empty>
      );
    }

    if (previewMode === 'empty') {
      return (
        <Empty className="min-h-[540px] border border-dashed border-slate-200 bg-slate-50/70">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-sky-50 text-sky-600">
              <Users className="size-4" />
            </EmptyMedia>
            <EmptyTitle>등록된 멤버가 없습니다</EmptyTitle>
            <EmptyDescription>
              아직 멤버가 등록되지 않았습니다. 오른쪽 초대 패널에서 새 멤버를 추가하면,
              초대 대기 상태로 바로 표시됩니다.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="default" size="sm" onClick={() => setPreviewMode('list')}>
              더미 데이터 보기
            </Button>
          </EmptyContent>
        </Empty>
      );
    }

    if (previewMode === 'loading') {
      return (
        <div className="h-full min-h-0 overflow-auto rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>

          <div className="mt-3 overflow-auto rounded-lg border border-slate-200 bg-white">
            <div className="min-w-[1120px]">
            <div className="grid grid-cols-[2fr_1.1fr_0.9fr_1fr_1fr_0.9fr] gap-3 border-b bg-slate-50 px-4 py-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`header-skeleton-${index}`} className="h-4 w-full" />
              ))}
            </div>

            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`row-skeleton-${index}`}
                  className="grid grid-cols-[2fr_1.1fr_0.9fr_1fr_1fr_0.9fr] items-center gap-3 rounded-lg border border-slate-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <div className="flex items-center gap-2 justify-end">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      );
    }

    if (filteredMembers.length === 0) {
      return (
        <Empty className="min-h-[540px] border border-dashed border-slate-200 bg-slate-50/70">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-amber-50 text-amber-600">
              <Search className="size-4" />
            </EmptyMedia>
            <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
            <EmptyDescription>
              검색어, 상태, 티어 필터를 조정하면 결과가 다시 나타납니다.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              필터 초기화
            </Button>
          </EmptyContent>
        </Empty>
      );
    }

    return (
      <div className="h-full min-h-0 overflow-auto rounded-xl border border-slate-200 bg-white">
        <Table className="min-w-[1120px]">
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="w-[280px] font-semibold text-slate-700">멤버</TableHead>
              <TableHead className="w-[180px] font-semibold text-slate-700">역할</TableHead>
              <TableHead className="w-[140px] font-semibold text-slate-700">상태</TableHead>
              <TableHead className="w-[170px] font-semibold text-slate-700">최근 로그인</TableHead>
              <TableHead className="w-[150px] font-semibold text-slate-700">초대 상태</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => {
              const roleOption = ROLE_OPTIONS.find((option) => option.value === member.role);
              const isPendingInvite = member.status === 'PENDING_INVITE';
              const isProtected = member.isMe;

              return (
                <TableRow key={member.id} className={member.isMe ? 'bg-slate-50/80' : ''}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          {member.isMe ? (
                            <Badge variant="secondary" className="h-5 bg-sky-100 text-sky-700 hover:bg-sky-100">
                              내 계정
                            </Badge>
                          ) : null}
                        </div>
                        <p className="truncate text-sm text-slate-500">{member.email}</p>
                        {member.note ? <p className="text-xs text-slate-400">{member.note}</p> : null}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={roleOption?.badgeClassName ?? 'bg-slate-100 text-slate-700 hover:bg-slate-100'}>
                        {roleOption?.label ?? member.role}
                      </Badge>
                      <select
                        value={member.role}
                        disabled={isProtected}
                        onChange={(event) => updateMemberRole(member.id, event.target.value as MemberRole)}
                        className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </TableCell>

                  <TableCell>
                    <MemberStatusBadge status={member.status} />
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-slate-800">
                        {member.lastLoginAt ?? '-'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {member.lastLoginAt ? '최근 활동 완료' : '아직 로그인 기록 없음'}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <InviteStatusBadge inviteStatus={member.inviteStatus} />
                      <p className="text-xs text-slate-400">
                        초대일:
                        {' '}
                        {member.invitedAt}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {isPendingInvite ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => resendInvite(member.id)}
                          >
                            <Send className="size-3.5" />
                            재전송
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => cancelInvite(member.id)}
                          >
                            <CircleX className="size-3.5" />
                            취소
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant={member.status === 'ACTIVE' ? 'outline' : 'default'}
                          className="gap-1.5"
                          disabled={isProtected}
                          onClick={() => toggleMemberStatus(member.id)}
                        >
                          {member.status === 'ACTIVE' ? (
                            <>
                              <Ban className="size-3.5" />
                              비활성화
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-3.5" />
                              활성화
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="mx-auto grid h-full min-h-0 max-w-[1440px] grid-rows-[auto_auto_minmax(0,1fr)] gap-6 overflow-hidden p-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <Shield className="size-3.5 text-sky-600" />
              MEMBER resource preview
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                멤버 관리
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-500">
                로그인 계정이 속한 조직의 멤버를 조회하고, 역할과 활성 상태를 관리하는 목업 화면입니다.
                현재 단계에서는 API 없이 더미 데이터와 로컬 상태만으로 화면 흐름을 검증합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={handleRefresh}>
              <RefreshCcw className="size-3.5" />
              새로고침
            </Button>
            <Button className="gap-2" onClick={() => setPreviewMode('list')}>
              <Plus className="size-3.5" />
              목록으로
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Users className="size-4" />}
          label="전체 멤버"
          value={totalCount}
          description="현재 조직에 연결된 계정 수"
        />
        <MetricCard
          icon={<CheckCircle2 className="size-4" />}
          label="활성 멤버"
          value={activeCount}
          description="로그인 가능한 계정 수"
        />
        <MetricCard
          icon={<Mail className="size-4" />}
          label="대기 초대"
          value={pendingInviteCount}
          description="승인 대기 중인 초대 수"
        />
      </div>

      <div className="grid min-h-0 gap-6 items-stretch lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="flex h-full flex-col overflow-hidden border-slate-200/80 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <UserCog className="size-5 text-sky-600" />
                멤버 목록
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                로그인 계정이 속한 조직의 멤버를 조회하고, 역할과 활성 상태를 관리합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PREVIEW_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={previewMode === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode(option.value)}
                  className="gap-1.5"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] gap-4 py-4">
            <div className="grid gap-3 xl:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="이름, 이메일, 역할로 검색"
                  className="pl-9"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'ALL' | MemberStatus)}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="ALL">모든 상태</option>
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                  <option value="PENDING_INVITE">초대 대기</option>
                </select>
              </div>

              <div>
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value as 'ALL' | MemberRole)}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="ALL">모든 티어</option>
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="outline" size="sm" className="gap-1.5" onClick={resetFilters}>
                <RefreshCcw className="size-3.5" />
                초기화
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <div>
                현재 표시:
                {' '}
                <span className="font-semibold text-slate-700">{filteredMembers.length}</span>
                명
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-slate-50 text-slate-600">
                  {previewMode === 'list' ? '목록 모드' : PREVIEW_OPTIONS.find((option) => option.value === previewMode)?.description}
                </Badge>
                {searchTerm ? <Badge variant="outline" className="bg-sky-50 text-sky-700">검색 중</Badge> : null}
                {statusFilter !== 'ALL' ? <Badge variant="outline" className="bg-amber-50 text-amber-700">상태 필터</Badge> : null}
                {roleFilter !== 'ALL' ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700">티어 필터</Badge> : null}
              </div>
            </div>

            <div className="min-h-0 overflow-auto pr-1">
              {renderMainState()}
            </div>
          </div>
        </Card>

        <div className="flex h-full">
          <Card id="member-invite-card" className="flex h-full w-full flex-col border-slate-200/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <UserPlus className="size-4 text-sky-600" />
                멤버 초대
              </CardTitle>
              <CardDescription>
                새 멤버를 초대하면 대기 상태로 목록에 즉시 반영되는 목업입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid min-h-0 flex-1 grid-rows-[auto_auto_auto_auto_minmax(0,1fr)] gap-4 p-4">
              <form className="grid min-h-0 grid-rows-[auto_auto_auto_auto_auto_minmax(0,1fr)] gap-4 overflow-auto pr-1" onSubmit={handleInviteSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="invite-name">이름</Label>
                  <Input
                    id="invite-name"
                    value={inviteDraft.name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setInviteDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder="예: Hana Lee"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-email">이메일</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteDraft.email}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setInviteDraft((current) => ({ ...current, email: event.target.value }))}
                    placeholder="member@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role">초대 티어</Label>
                  <select
                    id="invite-role"
                    value={inviteDraft.role}
                    onChange={(event) =>
                      setInviteDraft((current) => ({ ...current, role: event.target.value as MemberRole }))}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-note">메모</Label>
                  <Textarea
                    id="invite-note"
                    value={inviteDraft.note}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setInviteDraft((current) => ({ ...current, note: event.target.value }))}
                    placeholder="팀, 직무, 승인 배경 등"
                    className="min-h-24"
                  />
                </div>

                <Button type="submit" className="w-full gap-2">
                  <Send className="size-3.5" />
                  초대 메일 보내기
                </Button>
              </form>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                초대는 목업상 즉시 목록에 반영되며, 실제 발송과 승인 플로우는 다음 단계에서 API로 연결합니다.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode
  label: string
  value: number
  description: string
}) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function MemberStatusBadge({ status }: { status: MemberStatus }) {
  if (status === 'ACTIVE') {
    return (
      <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        활성
      </Badge>
    );
  }

  if (status === 'INACTIVE') {
    return (
      <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
        비활성
      </Badge>
    );
  }

  return (
    <Badge className="border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100">
      초대 대기
    </Badge>
  );
}

function InviteStatusBadge({ inviteStatus }: { inviteStatus: InviteStatus }) {
  if (inviteStatus === 'ACCEPTED') {
    return (
      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
        수락 완료
      </Badge>
    );
  }

  if (inviteStatus === 'PENDING') {
    return (
      <Badge className="border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100">
        초대 대기
      </Badge>
    );
  }

  if (inviteStatus === 'EXPIRED') {
    return (
      <Badge className="border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100">
        만료
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
      취소됨
    </Badge>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
