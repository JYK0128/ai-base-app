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
import { Eye, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

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
    actor: 'manager@platform.com',
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
        return <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-700 border-emerald-200">생성 (CREATE)</Badge>;
      case 'READ':
        return <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 border-blue-200">조회 (READ)</Badge>;
      case 'UPDATE':
        return <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-700 border-amber-200">수정 (UPDATE)</Badge>;
      case 'DELETE':
        return <Badge className="bg-rose-100 hover:bg-rose-100 text-rose-700 border-rose-200">삭제 (DELETE)</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            감사 로그 (Audit Logs)
          </h1>
          <p className="text-slate-500 text-sm">
            플랫폼 관리자 계정이 수행한 모든 데이터 생성, 변경, 권한 제어 활동이 기록되는 감사 레코드 보관소입니다.
          </p>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={() => {}}>
          <RefreshCw className="w-3.5 h-3.5" />
          새로고침
        </Button>
      </div>

      {/* Filters Controls Grid */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-semibold text-slate-800">검색 및 필터링 제어</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="수행자, 변경 대상, IP로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">모든 결과 상태 (ALL)</option>
              <option value="SUCCESS">성공 (SUCCESS)</option>
              <option value="FAILURE">실패 (FAILURE)</option>
            </select>
          </div>

          <div className="flex items-center text-xs text-slate-400 justify-end">
            총
            {' '}
            {filteredLogs.length}
            개의 감사 로그 항목 조회됨
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-slate-200/80 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 w-[180px]">일시 (UTC)</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[240px]">수행 계정 (Actor)</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[140px]">수행 액션</TableHead>
                <TableHead className="font-semibold text-slate-700">변경 대상 (Target)</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[130px]">수행 IP</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[100px] text-center">결과</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[80px] text-center">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                  <TableCell className="font-semibold text-slate-800">{log.actor}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 max-w-[250px] truncate" title={log.target}>
                    {log.target}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'} className="scale-90 px-1.5 py-0 text-xs">
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:text-blue-600"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-12">
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
            <DialogTitle className="flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
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
              <div className="grid grid-cols-2 gap-3 text-sm border-b pb-3 border-slate-100">
                <div>
                  <span className="text-slate-400 block text-xs">수행 계정</span>
                  <span className="font-semibold text-slate-800">{selectedLog.actor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">변경 일시</span>
                  <span className="font-semibold text-slate-800 font-mono text-xs">{selectedLog.timestamp}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-xs">수행 액션</span>
                  <span>{getActionBadge(selectedLog.action)}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-xs">클라이언트 IP</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block text-xs font-semibold">감사 대상 자원 식별자 (Target Object)</span>
                <div className="bg-slate-100 text-slate-800 rounded p-2 text-xs font-mono border">
                  {selectedLog.target}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block text-xs font-semibold">데이터베이스 변경 트랜잭션 페이로드 (Metadata)</span>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-auto max-h-[220px]">
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
    </div>
  );
}
