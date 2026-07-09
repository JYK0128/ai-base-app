import { Badge,
         Button,
         Card,
         CardContent,
         CardHeader,
         CardTitle,
         Dialog,
         DialogContent,
         DialogDescription,
         DialogFooter,
         DialogHeader,
         DialogTitle,
         Input,
         Table,
         TableBody,
         TableCell,
         TableHead,
         TableHeader,
         TableRow } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Eye, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';

import { ConsoleFrame } from '../-components/ConsoleFrame';
import { ConsoleSections } from '../-components/ConsoleSections';

// ==========================================
// TanStack Route Definition
// ==========================================
export const Route = createFileRoute('/_protected/audit/')({
  component: AuditPage,
});

interface AuditLogMock {
  id: string
  actor: string
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  target: string
  ipAddress: string
  status: 'SUCCESS' | 'FAILURE'
  timestamp: string
  details: string
}

const MOCK_AUDIT_LOGS: AuditLogMock[] = [
  {
    id: 'log-001',
    actor: 'admin@platform.com',
    action: 'UPDATE',
    target: 'ROLE_PERMISSIONS:PLATFORM.ADMIN',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    timestamp: '2026-05-18T10:45:12Z',
    details: JSON.stringify({
      roleCode: 'PLATFORM.ADMIN',
      addedPermissions: ['AUDIT:READ'],
      removedPermissions: [],
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    }, null, 2),
  },
  {
    id: 'log-002',
    actor: 'admin@platform.com',
    action: 'UPDATE',
    target: 'ORGANIZATION:Kakao Corp',
    ipAddress: '192.168.1.x',
    status: 'SUCCESS',
    timestamp: '2026-05-18T10:42:05Z',
    details: JSON.stringify({
      orgId: 'org-kakao-123',
      previousStatus: 'PENDING',
      newStatus: 'ACTIVE',
      approvedBy: 'admin@platform.com',
    }, null, 2),
  },
  {
    id: 'log-003',
    actor: 'member@platform.com',
    action: 'CREATE',
    target: 'ANNOUNCEMENT:System Maintenance',
    ipAddress: '10.0.0.x',
    status: 'SUCCESS',
    timestamp: '2026-05-18T09:15:30Z',
    details: JSON.stringify({
      title: '정기 시스템 점검 안내',
      category: 'MAINTENANCE',
      publishDate: '2026-05-19T02:00:00Z',
    }, null, 2),
  },
  {
    id: 'log-004',
    actor: 'unauthorized_attacker@hacker.io',
    action: 'DELETE',
    target: 'ORGANIZATION:Naver Corp',
    ipAddress: '203.0.113.x',
    status: 'FAILURE',
    timestamp: '2026-05-18T08:59:12Z',
    details: JSON.stringify({
      reason: 'FORBIDDEN_ACCESS',
      errorMessage: 'Access Denied: Required permission ORGANIZATION:DELETE is missing',
      headers: {
        host: 'localhost:5173',
        referer: 'http://localhost:5173/organizations',
      },
    }, null, 2),
  },
  {
    id: 'log-005',
    actor: 'admin@platform.com',
    action: 'CREATE',
    target: 'TERMS_DOCUMENT:SERVICE_TOS',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    timestamp: '2026-05-17T23:58:00Z',
    details: JSON.stringify({
      code: 'SERVICE_TOS',
      title: '서비스 이용약관 개정안',
      required: true,
    }, null, 2),
  },
];

function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogMock | null>(null);

  const handleRefresh = () => {
    setSearchTerm('');
    setActionFilter('ALL');
    setStatusFilter('ALL');
    setSelectedLog(null);
  };

  // Filters logic
  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch
      = log.actor.toLowerCase().includes(searchTerm.toLowerCase())
        || log.target.toLowerCase().includes(searchTerm.toLowerCase())
        || log.ipAddress.includes(searchTerm);

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesAction && matchesStatus;
  });

  const getActionBadge = (action: AuditLogMock['action']) => {
    switch (action) {
      case 'CREATE':
        return (
          <Badge className="
            border-emerald-200 bg-emerald-100 text-emerald-700
            hover:bg-emerald-100
          "
          >
            생성 (CREATE)
          </Badge>
        );
      case 'READ':
        return (
          <Badge className="
            border-blue-200 bg-blue-100 text-blue-700
            hover:bg-blue-100
          "
          >
            조회 (READ)
          </Badge>
        );
      case 'UPDATE':
        return (
          <Badge className="
            border-amber-200 bg-amber-100 text-amber-700
            hover:bg-amber-100
          "
          >
            수정 (UPDATE)
          </Badge>
        );
      case 'DELETE':
        return (
          <Badge className="
            border-rose-200 bg-rose-100 text-rose-700
            hover:bg-rose-100
          "
          >
            삭제 (DELETE)
          </Badge>
        );
    }
  };

  return (
    <ConsoleFrame
      title="감사 로그"
      description="플랫폼 관리자 계정이 수행한 모든 데이터 생성, 변경, 권한 제어 활동이 기록되는 감사 레코드 보관소입니다."
      actions={[
        <Button key="refresh" variant="outline" className="gap-1.5" onClick={handleRefresh}>
          <RefreshCw className="size-3.5" />
          새로고침
        </Button>,
      ]}
    >
      <ConsoleSections>
        <Card className="flex-none border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200 py-4">
            <CardTitle className="text-sm font-semibold text-slate-800">검색 및 필터링 제어</CardTitle>
          </CardHeader>
          <CardContent className="
            grid grid-cols-1 gap-4
            md:grid-cols-4
          "
          >
            <div className="relative">
              <Search className="
                absolute top-2.5 left-2.5 size-4 text-slate-400
              "
              />
              <Input
                placeholder="수행자, 변경 대상, IP로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white pl-9"
              />
            </div>

            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="
                  w-full rounded-md border border-slate-300 bg-white px-3 py-2
                  text-sm
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                "
              >
                <option value="ALL">모든 수행 액션 (ALL)</option>
                <option value="CREATE">생성 (CREATE)</option>
                <option value="READ">조회 (READ)</option>
                <option value="UPDATE">수정 (UPDATE)</option>
                <option value="DELETE">삭제 (DELETE)</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  w-full rounded-md border border-slate-300 bg-white px-3 py-2
                  text-sm
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                "
              >
                <option value="ALL">모든 결과 상태 (ALL)</option>
                <option value="SUCCESS">성공 (SUCCESS)</option>
                <option value="FAILURE">실패 (FAILURE)</option>
              </select>
            </div>

            <div className="
              flex items-center justify-end text-xs text-slate-400
            "
            >
              총
              {' '}
              {filteredLogs.length}
              개의 감사 로그 항목 조회됨
            </div>
          </CardContent>
        </Card>

        <Card className="
          flex flex-1 flex-col overflow-hidden border-slate-200 bg-white
          shadow-sm
        "
        >
          <CardContent className="scroll flex-1 p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-45 font-semibold text-slate-700">일시 (UTC)</TableHead>
                  <TableHead className="w-60 font-semibold text-slate-700">수행 계정 (Actor)</TableHead>
                  <TableHead className="w-35 font-semibold text-slate-700">수행 액션</TableHead>
                  <TableHead className="font-semibold text-slate-700">변경 대상 (Target)</TableHead>
                  <TableHead className="w-32.5 font-semibold text-slate-700">수행 IP</TableHead>
                  <TableHead className="
                    w-25 text-center font-semibold text-slate-700
                  "
                  >
                    결과
                  </TableHead>
                  <TableHead className="
                    w-20 text-center font-semibold text-slate-700
                  "
                  >
                    상세
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{log.actor}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell
                      className="
                        max-w-62.5 truncate font-mono text-xs text-slate-600
                      "
                      title={log.target}
                    >
                      {log.target}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}
                        className="scale-90 px-1.5 py-0 text-xs"
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="
                          size-7 p-0
                          hover:text-blue-600
                        "
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-slate-400"
                    >
                      조건에 일치하는 감사 로그 레코드가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* DIALOG: DETAIL LOG VIEW */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="max-w-xl bg-white">
            <DialogHeader>
              <DialogTitle>
                상세 보안 감사 기록 (
                {selectedLog?.id}
                )
              </DialogTitle>
              <DialogDescription>
                트랜잭션이 발생할 때 시스템 인가 프레임워크가 캡처한 물리적인 메타데이터 페이로드 내역입니다.
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <div className="
                  grid grid-cols-2 gap-3 border-b border-slate-100 pb-3 text-sm
                "
                >
                  <div>
                    <span className="block text-xs text-slate-400">수행 계정</span>
                    <span className="font-semibold text-slate-800">{selectedLog.actor}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">변경 일시</span>
                    <span className="
                      font-mono text-xs font-semibold text-slate-800
                    "
                    >
                      {selectedLog.timestamp}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="block text-xs text-slate-400">수행 액션</span>
                    <span>{getActionBadge(selectedLog.action)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="block text-xs text-slate-400">클라이언트 IP</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedLog.ipAddress}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-400">감사 대상 자원 식별자 (Target Object)</span>
                  <div className="
                    rounded-sm border bg-slate-100 p-2 font-mono text-xs
                    text-slate-800
                  "
                  >
                    {selectedLog.target}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-400">데이터베이스 변경 트랜잭션 페이로드 (Metadata)</span>
                  <pre className="
                    scroll max-h-55 rounded-lg bg-slate-900 p-3 font-mono
                    text-xs text-slate-100
                  "
                  >
                    <code>{selectedLog.details}</code>
                  </pre>
                </div>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button type="button" onClick={() => setSelectedLog(null)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ConsoleSections>
    </ConsoleFrame>
  );
}
