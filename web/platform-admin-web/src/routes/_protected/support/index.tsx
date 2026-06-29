import { Badge,
         Button,
         Dialog,
         DialogContent,
         DialogDescription,
         DialogFooter,
         DialogHeader,
         DialogTitle,
         Table,
         TableBody,
         TableCell,
         TableHead,
         TableHeader,
         TableRow } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeftRight, Building2, CalendarClock, MessageSquareText, Ticket } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useSupportControllerGetTicketPageV1 } from '@/api/generated/endpoints';
import type { GetTicketPageItem } from '@/api/generated/model';
import { pickApiItems } from '@/lib/api-response';

export const Route = createFileRoute('/_protected/support/')({
  component: SupportPage,
});

function SupportPage() {
  const { data } = useSupportControllerGetTicketPageV1<GetTicketPageItem[]>(undefined, {
    query: {
      select: (response) => pickApiItems(response),
    },
  });
  const tickets = useMemo(() => data ?? [], [data]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [selectedTicketId, tickets],
  );
  const selectedTicketContent = selectedTicket === null
    ? null
    : (
      <div className="space-y-4">
        <div className="
          grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm
          text-slate-700
          md:grid-cols-2
        "
        >
          <div className="space-y-1">
            <p className="text-xs text-slate-500">티켓 제목</p>
            <p className="font-medium text-slate-900">{selectedTicket.title}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">조직 식별자</p>
            <p className="font-medium text-slate-900">{selectedTicket.organization}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">우선순위</p>
            <p className="font-medium text-slate-900">{selectedTicket.priority}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">상태</p>
            <p className="font-medium text-slate-900">{selectedTicket.status}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">등록일</p>
            <p className="font-medium text-slate-900">{selectedTicket.createdAt}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">식별자</p>
            <p className="font-medium text-slate-900">{selectedTicket.id}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="
            flex items-center gap-2 text-sm font-semibold text-slate-900
          "
          >
            <MessageSquareText className="size-4 text-slate-500" />
            문의 내용
          </div>
          <div className="
            rounded-lg border border-slate-200 bg-white p-4 text-sm/7
            text-slate-700
          "
          >
            {selectedTicket.content}
          </div>
        </div>

        <div className="
          grid gap-2 text-xs text-slate-500
          sm:grid-cols-3
        "
        >
          <div className="flex items-center gap-2">
            <Building2 className="size-3.5" />
            조직 단위 티켓
          </div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="size-3.5" />
            목록에서 직접 조회
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="size-3.5" />
            상세 API 없음
          </div>
        </div>
      </div>
    );

  return (
    <div className="
      mx-auto flex size-full max-w-300 flex-col gap-6 overflow-hidden p-6
    "
    >
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">고객 지원 (티켓)</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          접수된 티켓을 확인하고 처리 상태를 관리합니다.
        </p>
      </header>

      <div className="
        flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200
        bg-white
      "
      >
        <div className="scroll flex-1">
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
                  <TableCell>{ticket.organization}</TableCell>
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
                    <Button size="sm" variant="outline" onClick={() => setSelectedTicketId(ticket.id)}>
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="size-5 text-sky-600" />
              티켓 상세
            </DialogTitle>
            <DialogDescription>선택한 티켓의 내용을 확인합니다.</DialogDescription>
          </DialogHeader>

          {selectedTicketContent}

          <DialogFooter>
            <Button type="button" onClick={() => setSelectedTicketId(null)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
