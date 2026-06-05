import { Badge,
         Button,
         Table,
         TableBody,
         TableCell,
         TableHead,
         TableHeader,
         TableRow } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';

import { useSupportControllerGetTicketsV1 } from '../../../api/endpoints';
import type { TicketResponseDto } from '../../../api/model';

export const Route = createFileRoute('/_protected/support/')({
  component: SupportPage,
});

function SupportPage() {
  const { data } = useSupportControllerGetTicketsV1();
  const tickets: TicketResponseDto[] = data?.data ?? [];

  return (
    <div className="size-full mx-auto flex max-w-300 min-h-0 flex-col gap-6 overflow-hidden p-6">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">고객 지원 (티켓)</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          접수된 티켓을 확인하고 처리 상태를 관리합니다.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>조직 ID</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell>{ticket.organizationId}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.priority === 'URGENT' || ticket.priority === 'HIGH' ? 'destructive' : 'default'}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>{ticket.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">상세보기</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
