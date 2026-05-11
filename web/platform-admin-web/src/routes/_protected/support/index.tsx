import { Badge,
         Button,
         Table,
         TableBody,
         TableCell,
         TableHead,
         TableHeader,
         TableRow } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';

import { useCoreControllerGetTicketsV1 } from '../../../api/endpoints';
import type { TicketResponseDto } from '../../../api/model';

export const Route = createFileRoute('/_protected/support/')({
  component: SupportPage,
});

function SupportPage() {
  const { data } = useCoreControllerGetTicketsV1();
  const tickets: TicketResponseDto[] = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">고객 지원 (티켓)</h1>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
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
  );
}
