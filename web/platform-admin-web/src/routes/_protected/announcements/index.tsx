import { Badge,
         Button,
         Table,
         TableBody,
         TableCell,
         TableHead,
         TableHeader,
         TableRow } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';

import { useCoreControllerGetAnnouncementsV1 } from '../../../api/endpoints';
import type { AnnouncementResponseDto } from '../../../api/model';

export const Route = createFileRoute('/_protected/announcements/')({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { data } = useCoreControllerGetAnnouncementsV1();
  const announcements: AnnouncementResponseDto[] = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Button>공지사항 등록</Button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>내용</TableHead>
              <TableHead>게시 여부</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.content}</TableCell>
                <TableCell>
                  <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                    {item.isPublished ? '게시 중' : '초안'}
                  </Badge>
                </TableCell>
                <TableCell>{item.createdAt}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost">수정</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
