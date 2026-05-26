import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';
import {
  Ban,
  CheckCircle2,
  CircleX,
  ChevronDown,
  Mail,
  RefreshCcw,
  Search,
  Send,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, type ReactNode, useState } from 'react';

export const Route = createFileRoute('/_protected/members/')({
  component: MembersPage,
});

type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_INVITE';
type InviteStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'EXPIRED' | 'CANCELED';
type MemberRole = 'OWNER' | 'MANAGER' | 'MEMBER';

interface MemberMock {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
  lastLoginAt: string | null
  note?: string
  isMe?: boolean
}

interface InviteMock {
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
  memberId?: string
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

const INITIAL_INVITES: InviteMock[] = [
  {
    id: 'member-001',
    name: 'Admin User',
    email: 'admin@platform.com',
    role: 'OWNER',
    status: 'ACTIVE',
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
    inviteStatus: 'APPROVED',
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
  {
    id: 'member-021',
    name: 'Rejected User',
    email: 'rejected@platform.com',
    role: 'MEMBER',
    status: 'INACTIVE',
    inviteStatus: 'REJECTED',
    lastLoginAt: null,
    invitedAt: '2026-05-21 17:05',
    invitedBy: 'admin@platform.com',
    note: '초대 거절',
  },
];

const INITIAL_MEMBERS: MemberMock[] = INITIAL_INVITES
  .filter((invite) => invite.inviteStatus === 'APPROVED')
  .map((invite) => toMemberRecord(invite));

function toMemberRecord(invite: InviteMock): MemberMock {
  return {
    id: invite.memberId ?? invite.id,
    name: invite.name,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    lastLoginAt: invite.lastLoginAt,
    note: invite.note,
    isMe: invite.isMe,
  };
}

function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | MemberRole>('ALL');
  const [inviteStatusFilter, setInviteStatusFilter] = useState<'ALL' | InviteStatus>('ALL');
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [members, setMembers] = useState<MemberMock[]>(INITIAL_MEMBERS);
  const [invites, setInvites] = useState<InviteMock[]>(INITIAL_INVITES);
  const [inviteDraft, setInviteDraft] = useState<InviteDraft>({
    name: '',
    email: '',
    role: 'MANAGER',
    note: '',
  });

  const totalCount = members.length;
  const memberList = members;
  const inviteList = invites;
  const activeCount = memberList.filter((member) => member.status === 'ACTIVE').length;
  const pendingInviteCount = inviteList.filter((member) => member.inviteStatus === 'PENDING').length;
  const approvedInviteCount = inviteList.filter((member) => member.inviteStatus === 'APPROVED').length;
  const rejectedInviteCount = inviteList.filter((member) => member.inviteStatus === 'REJECTED').length;
  const expiredInviteCount = inviteList.filter((member) => member.inviteStatus === 'EXPIRED').length;
  const canceledInviteCount = inviteList.filter((member) => member.inviteStatus === 'CANCELED').length;

  const filteredMembers = memberList.filter((member) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query
      || member.name.toLowerCase().includes(query)
      || member.email.toLowerCase().includes(query)
      || member.role.toLowerCase().includes(query);
    const matchesStatus = memberStatusFilter === 'ALL' || member.status === memberStatusFilter;
    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const filteredInvites = inviteList.filter((invite) => {
    return inviteStatusFilter === 'ALL' || invite.inviteStatus === inviteStatusFilter;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setMemberStatusFilter('ALL');
    setRoleFilter('ALL');
    setInviteStatusFilter('ALL');
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
    setInvites((current) =>
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

  const reviveInvite = (memberId: string) => {
    setInvites((current) =>
      current.map((member) => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          status: 'PENDING_INVITE',
          inviteStatus: 'PENDING',
        };
      }),
    );
  };

  const approveInvite = (memberId: string) => {
    let approvedInvite: InviteMock | undefined;
    setInvites((current) =>
      current.map((member) => {
        if (member.id !== memberId) return member;
        approvedInvite = {
          ...member,
          status: 'ACTIVE',
          inviteStatus: 'APPROVED',
        };
        return approvedInvite;
      }),
    );

    if (!approvedInvite) return;

    setMembers((current) => {
      const nextMember = toMemberRecord({
        ...approvedInvite,
        status: 'ACTIVE',
      });

      if (current.some((member) => member.email.toLowerCase() === nextMember.email.toLowerCase())) {
        return current.map((member) => (member.email.toLowerCase() === nextMember.email.toLowerCase() ? nextMember : member));
      }

      return [nextMember, ...current];
    });
  };

  const rejectInvite = (memberId: string) => {
    setInvites((current) =>
      current.map((member) => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          status: 'INACTIVE',
          inviteStatus: 'REJECTED',
        };
      }),
    );
  };

  const cancelInvite = (memberId: string) => {
    setInvites((current) =>
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
    const duplicateExists = members.some((member) => member.email.toLowerCase() === email)
      || invites.some((invite) => invite.email.toLowerCase() === email);
    if (duplicateExists) return;

    setInvites((current) => [
      {
        id: `invite-${Date.now()}`,
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
    ]);

    setInviteDraft({
      name: '',
      email: '',
      role: 'MANAGER',
      note: '',
    });
    setInviteDrawerOpen(false);
  };

  const handleRefresh = () => {
    resetFilters();
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">멤버 관리</h1>
          <p className="text-slate-500 mt-1 text-sm">
            로그인 계정이 속한 조직의 멤버를 조회하고, 역할과 활성 상태를 관리합니다.
          </p>
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

      <TooltipProvider delayDuration={1200}>
        <div className="grid min-h-0 gap-6">
        <Card className="flex h-full flex-col overflow-hidden border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-200/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <UserCog className="size-4 text-sky-600" />
                  멤버 목록
                </CardTitle>
                <CardDescription>
                  로그인 계정이 속한 조직의 멤버를 조회하고, 역할과 활성 상태를 관리합니다.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={handleRefresh}>
                  <RefreshCcw className="size-3.5" />
                  필터 초기화
                </Button>

                <Drawer open={inviteDrawerOpen} onOpenChange={setInviteDrawerOpen} direction="right">
                  <DrawerTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="size-3.5" />
                      멤버 초대
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-full w-[440px] max-w-[90vw] bg-white p-0">
                    <div className="flex h-full min-h-0 flex-col">
                      <DrawerHeader className="border-b border-slate-200 px-4 py-4">
                        <DrawerTitle className="flex items-center gap-2 text-slate-900">
                          <UserPlus className="size-4 text-sky-600" />
                          멤버 초대
                        </DrawerTitle>
                        <DrawerDescription className="text-slate-500">
                          새 멤버를 초대하면 대기 상태로 목록에 즉시 반영되는 목업입니다.
                        </DrawerDescription>
                      </DrawerHeader>

                      <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4" onSubmit={handleInviteSubmit}>
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

                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                          초대는 목업상 즉시 목록에 반영되며, 실제 발송과 승인 플로우는 다음 단계에서 API로 연결합니다.
                        </div>

                        <DrawerFooter className="border-t border-slate-200 px-4 py-4">
                          <div className="flex gap-2">
                            <DrawerClose asChild>
                              <Button type="button" variant="outline" className="flex-1">
                                닫기
                              </Button>
                            </DrawerClose>
                            <Button type="submit" className="flex-1 gap-2">
                              <Send className="size-3.5" />
                              초대 메일 보내기
                            </Button>
                          </div>
                        </DrawerFooter>
                      </form>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid min-h-0 flex-1 p-4">
            <Tabs defaultValue="members" className="flex min-h-0 flex-col gap-4">
              <TabsList variant="line" className="w-fit">
                <TabsTrigger value="members" className="px-3">
                  멤버 목록
                  <Badge variant="outline" className="ml-1 bg-slate-50 text-slate-600">
                    {filteredMembers.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="invitations" className="px-3">
                  초대 목록
                  <Badge variant="outline" className="ml-1 bg-slate-50 text-slate-600">
                    {inviteList.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="min-h-0">
                <div className="grid min-h-0 gap-4">
                  <div className="grid gap-3 xl:grid-cols-[1.4fr_0.8fr_0.8fr]">
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
                        value={memberStatusFilter}
                        onChange={(event) => setMemberStatusFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                        className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      >
                        <option value="ALL">모든 상태</option>
                        <option value="ACTIVE">활성</option>
                        <option value="INACTIVE">비활성</option>
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
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                    <div>
                      현재 표시:
                      {' '}
                      <span className="font-semibold text-slate-700">{filteredMembers.length}</span>
                      명
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm ? <Badge variant="outline" className="bg-sky-50 text-sky-700">검색 중</Badge> : null}
                      {memberStatusFilter !== 'ALL' ? <Badge variant="outline" className="bg-amber-50 text-amber-700">상태 필터</Badge> : null}
                      {roleFilter !== 'ALL' ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700">티어 필터</Badge> : null}
                    </div>
                  </div>

                  <div className="min-h-0 overflow-auto rounded-xl border border-slate-200 bg-white">
                    {filteredMembers.length === 0 ? (
                      <Empty className="min-h-[420px] border-0 bg-white">
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
                    ) : (
                      <Table className="min-w-[1120px] table-fixed">
                        <TableHeader className="bg-slate-50/70">
                          <TableRow>
                            <TableHead className="w-[320px] font-semibold text-slate-700">멤버</TableHead>
                            <TableHead className="w-[180px] text-center font-semibold text-slate-700">역할</TableHead>
                            <TableHead className="w-[140px] text-center font-semibold text-slate-700">상태</TableHead>
                            <TableHead className="w-[180px] text-center font-semibold text-slate-700">최근 로그인</TableHead>
                            <TableHead className="w-[180px] text-right font-semibold text-slate-700">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMembers.map((member) => {
                            const isProtected = member.isMe;

                            return (
                              <TableRow key={member.id} className={member.isMe ? 'bg-slate-50/80' : ''}>
                                <TableCell className="align-middle py-4">
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

                                <TableCell className="align-middle py-4">
                                  <div className="flex justify-center">
                                    <select
                                      value={member.role}
                                      disabled={isProtected}
                                      onChange={(event) => updateMemberRole(member.id, event.target.value as MemberRole)}
                                      className="h-8 w-full max-w-[160px] rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                      {ROLE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </TableCell>

                                <TableCell className="align-middle py-4 text-center">
                                  <div className="flex justify-center">
                                    <MemberStatusBadge status={member.status} />
                                  </div>
                                </TableCell>

                                <TableCell className="align-middle py-4 text-center">
                                  <div className="space-y-1">
                                    <p className="font-medium text-slate-800">
                                      {member.lastLoginAt ?? '-'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {member.lastLoginAt ? '최근 활동 완료' : '아직 로그인 기록 없음'}
                                    </p>
                                  </div>
                                </TableCell>

                                <TableCell className="align-middle py-4 text-right">
                                  <div className="flex flex-wrap justify-end gap-2">
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
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="invitations" className="min-h-0">
                <div className="grid min-h-0 gap-4">
                  <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-end">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">초대 상태 필터</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={inviteStatusFilter === 'ALL' ? 'default' : 'outline'}
                          onClick={() => setInviteStatusFilter('ALL')}
                        >
                          전체
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={inviteStatusFilter === 'APPROVED' ? 'default' : 'outline'}
                          onClick={() => setInviteStatusFilter('APPROVED')}
                        >
                          승인
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={inviteStatusFilter === 'REJECTED' ? 'default' : 'outline'}
                          onClick={() => setInviteStatusFilter('REJECTED')}
                        >
                          거절
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={inviteStatusFilter === 'PENDING' ? 'default' : 'outline'}
                          onClick={() => setInviteStatusFilter('PENDING')}
                        >
                          대기
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={inviteStatusFilter === 'EXPIRED' ? 'default' : 'outline'}
                          onClick={() => setInviteStatusFilter('EXPIRED')}
                        >
                          만료
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={inviteStatusFilter === 'CANCELED' ? 'default' : 'outline'}
                          onClick={() => setInviteStatusFilter('CANCELED')}
                        >
                          취소
                        </Button>
                      </div>
                    </div>

                    <Button variant="outline" className="gap-2" onClick={resetFilters}>
                      <RefreshCcw className="size-3.5" />
                      필터 초기화
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                    <div>
                      전체 초대:
                      {' '}
                      <span className="font-semibold text-slate-700">{filteredInvites.length}</span>
                      건
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        승인 {approvedInviteCount}
                      </Badge>
                      <Badge variant="outline" className="bg-rose-50 text-rose-700">
                        거절 {rejectedInviteCount}
                      </Badge>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        대기 {pendingInviteCount}
                      </Badge>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        만료 {expiredInviteCount}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600">
                        취소 {canceledInviteCount}
                      </Badge>
                    </div>
                  </div>

                  <div className="min-h-0 overflow-auto rounded-xl border border-slate-200 bg-white">
                    {filteredInvites.length === 0 ? (
                      <Empty className="min-h-[420px] border-0 bg-white">
                        <EmptyHeader>
                          <EmptyMedia variant="icon" className="bg-sky-50 text-sky-600">
                            <Mail className="size-4" />
                          </EmptyMedia>
                          <EmptyTitle>초대 목록이 비어 있습니다</EmptyTitle>
                          <EmptyDescription>
                            아직 대기, 거절, 만료, 취소된 초대가 없습니다.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <Table className="min-w-[980px] table-fixed">
                        <TableHeader className="bg-slate-50/70">
                          <TableRow>
                            <TableHead className="w-[260px] font-semibold text-slate-700">초대 대상</TableHead>
                            <TableHead className="w-[120px] font-semibold text-slate-700">역할</TableHead>
                            <TableHead className="w-[110px] font-semibold text-slate-700">상태</TableHead>
                            <TableHead className="w-[170px] font-semibold text-slate-700">초대일</TableHead>
                            <TableHead className="w-[80px] text-center font-semibold text-slate-700">메모</TableHead>
                            <TableHead className="w-[240px] text-right font-semibold text-slate-700">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInvites.map((member) => {
                            const roleOption = ROLE_OPTIONS.find((option) => option.value === member.role);

                            return (
                              <TableRow key={member.id}>
                                <TableCell className="align-middle py-4">
                                  <div className="space-y-1">
                                    <div className="font-semibold text-slate-900">{member.name}</div>
                                    <p className="truncate text-sm text-slate-500">{member.email}</p>
                                  </div>
                                </TableCell>

                                <TableCell className="align-middle py-4">
                                  <Badge className={roleOption?.badgeClassName ?? 'bg-slate-100 text-slate-700 hover:bg-slate-100'}>
                                    {roleOption?.label ?? member.role}
                                  </Badge>
                                </TableCell>

                                <TableCell className="align-middle py-4">
                                  <InviteStatusBadge inviteStatus={member.inviteStatus} />
                                </TableCell>

                                <TableCell className="align-middle py-4">
                                  <div className="space-y-1">
                                    <p className="whitespace-nowrap font-medium text-slate-800">{member.invitedAt}</p>
                                    <p className="text-xs text-slate-400">보낸 사람: {member.invitedBy}</p>
                                  </div>
                                </TableCell>

                                <TableCell className="align-middle py-4 text-center">
                                  {member.note ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 px-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                          aria-label={`${member.name} 메모 보기`}
                                        >
                                          <span className="size-2 rounded-full bg-slate-400" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[280px] whitespace-pre-wrap text-left">
                                        {member.note}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span className="text-sm text-slate-300">-</span>
                                  )}
                                </TableCell>

                                <TableCell className="align-middle py-4 text-right">
                                  <InviteRowActions
                                    invite={member}
                                    approveInvite={approveInvite}
                                    rejectInvite={rejectInvite}
                                    resendInvite={resendInvite}
                                    cancelInvite={cancelInvite}
                                    reviveInvite={reviveInvite}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        </div>
      </TooltipProvider>
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
  if (inviteStatus === 'APPROVED') {
    return (
      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
        승인
      </Badge>
    );
  }

  if (inviteStatus === 'REJECTED') {
    return (
      <Badge className="border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100">
        거절
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
      <Badge className="border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100">
        만료
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
      취소
    </Badge>
  );
}

function InviteRowActions({
  invite,
  approveInvite,
  rejectInvite,
  resendInvite,
  cancelInvite,
  reviveInvite,
}: {
  invite: InviteMock
  approveInvite: (memberId: string) => void
  rejectInvite: (memberId: string) => void
  resendInvite: (memberId: string) => void
  cancelInvite: (memberId: string) => void
  reviveInvite: (memberId: string) => void
}) {
  const actionSet = getInviteActionSet(invite);

  if (!actionSet) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  const handleAction = (action: InviteActionItem) => {
    if (action.key === 'approve') {
      approveInvite(invite.id);
      return;
    }

    if (action.key === 'reject') {
      rejectInvite(invite.id);
      return;
    }

    if (action.key === 'resend') {
      resendInvite(invite.id);
      return;
    }

    if (action.key === 'cancel') {
      cancelInvite(invite.id);
      return;
    }

    reviveInvite(invite.id);
  };

  return (
    <div className="flex justify-end">
      {actionSet.secondary.length > 0 ? (
        <ButtonGroup>
          <Button
            size="sm"
            variant={actionSet.primary.variant}
            className="gap-1.5 whitespace-nowrap"
            onClick={() => handleAction(actionSet.primary)}
          >
            {actionSet.primary.icon}
            {actionSet.primary.label}
          </Button>
          <ButtonGroupSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant={actionSet.primary.variant}
                className="px-0"
                aria-label={`${invite.name} 추가 작업`}
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                {actionSet.secondary.map((action) => (
                  <DropdownMenuItem
                    key={action.key}
                    variant={action.variant}
                    onSelect={() => handleAction(action)}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      ) : (
        <Button
          size="sm"
          variant={actionSet.primary.variant}
          className="gap-1.5 whitespace-nowrap"
          onClick={() => handleAction(actionSet.primary)}
        >
          {actionSet.primary.icon}
          {actionSet.primary.label}
        </Button>
      )}
    </div>
  );
}

type InviteActionKey = 'approve' | 'reject' | 'resend' | 'cancel' | 'revive';

type InviteActionItem = {
  key: InviteActionKey
  label: string
  icon: ReactNode
  variant: 'default' | 'outline' | 'ghost' | 'destructive'
}

function getInviteActionSet(invite: InviteMock): {
  primary: InviteActionItem
  secondary: InviteActionItem[]
} | null {
  if (invite.inviteStatus === 'APPROVED') {
    return null;
  }

  if (invite.inviteStatus === 'PENDING') {
    return {
      primary: {
        key: 'approve',
        label: '승인',
        icon: <CheckCircle2 className="size-3.5" />,
        variant: 'default',
      },
      secondary: [
        {
          key: 'reject',
          label: '거절',
          icon: <CircleX className="size-3.5" />,
          variant: 'destructive',
        },
        {
          key: 'resend',
          label: '재전송',
          icon: <Send className="size-3.5" />,
          variant: 'outline',
        },
        {
          key: 'cancel',
          label: '취소',
          icon: <Ban className="size-3.5" />,
          variant: 'ghost',
        },
      ],
    };
  }

  if (invite.inviteStatus === 'REJECTED') {
    return {
      primary: {
        key: 'resend',
        label: '재초대',
        icon: <Send className="size-3.5" />,
        variant: 'default',
      },
      secondary: [
        {
          key: 'approve',
          label: '승인',
          icon: <CheckCircle2 className="size-3.5" />,
          variant: 'outline',
        },
      ],
    };
  }

  if (invite.inviteStatus === 'EXPIRED') {
    return {
      primary: {
        key: 'resend',
        label: '재전송',
        icon: <Send className="size-3.5" />,
        variant: 'default',
      },
      secondary: [
        {
          key: 'cancel',
          label: '취소',
          icon: <Ban className="size-3.5" />,
          variant: 'ghost',
        },
      ],
    };
  }

  return {
    primary: {
      key: 'revive',
      label: '복구',
      icon: <RefreshCcw className="size-3.5" />,
      variant: 'default',
    },
    secondary: [],
  };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
