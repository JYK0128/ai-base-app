import { Badge, Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';
import { type ChangeEvent, useState } from 'react';

import { useCoreControllerCreateTermsDocumentV1, useCoreControllerGetActiveTermsV1 } from '../../../api/endpoints';
import type { TermsDocumentResponseDto } from '../../../api/model';

export const Route = createFileRoute('/_protected/terms/')({
  component: TermsPage,
});

function TermsPage() {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');

  const { data, isFetching, refetch } = useCoreControllerGetActiveTermsV1();
  const terms: TermsDocumentResponseDto[] = data?.data ?? [];

  const { mutateAsync: createTermsDocument, isPending } = useCoreControllerCreateTermsDocumentV1();

  const createDraft = async () => {
    if (!title || !code) return;

    await createTermsDocument({
      data: {
        groupType: 'PLATFORM',
        title,
        code,
        required: true,
      },
    });

    setTitle('');
    setCode('');
    await refetch();
  };

  const onCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">약관 관리</h1>
        <Button onClick={() => { refetch().catch(() => {}); }} disabled={isFetching}>새로고침</Button>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">플랫폼 약관 초안 생성</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input value={code} onChange={onCodeChange} placeholder="코드 (예: SERVICE_TOS)" />
          <Input value={title} onChange={onTitleChange} placeholder="약관명" />
        </div>
        <Button onClick={() => { createDraft().catch(() => {}); }} disabled={isPending}>생성</Button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>구분</TableHead>
              <TableHead>코드</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>필수</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.groupType === 'PLATFORM' ? '플랫폼' : '조직'}</TableCell>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.required ? '필수' : '선택'}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}>{item.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {!isFetching && terms.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-10">등록된 약관이 없습니다.</TableCell>
                </TableRow>
              )
              : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
