import { Badge, Button, type ColumnDef, DataTable, toast } from '@pkg/ui';
import { useQueryClient } from '@tanstack/react-query';
import { Megaphone, Pin, Plus } from 'lucide-react';
import { useState } from 'react';

import { useAnnouncementsControllerCreateAnnouncementV1, useAnnouncementsControllerGetAnnouncementsV1 } from '../../../../api/endpoints';
import { ANNOUNCEMENT_AUDIENCE_LABELS, ANNOUNCEMENT_CATEGORY_LABELS, ANNOUNCEMENT_STATUS_LABELS, type AnnouncementAudience, type AnnouncementEditorSeed, type AnnouncementItem, type AnnouncementStatus, createBlankAnnouncement, formatDateTime } from '../-announcements.shared';
import { AnnouncementEditorModal } from '../-modals/AnnouncementEditorModal';
import { AnnouncementPreviewModal } from '../-modals/AnnouncementPreviewModal';

function getStatusTone(status: AnnouncementStatus) {
  switch (status) {
    case 'DRAFT':
      return 'border-slate-200 bg-slate-100 text-slate-700';
    case 'PUBLISHED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
}

const ANNOUNCEMENT_COLUMNS = [
  {
    accessorKey: 'title',
    header: '제목',
    size: 320,
    cell: ({ row, getValue, table }) => {
      const title = getValue<string>();
      const { action } = table.options.meta || {};

      return (
        <div className="space-y-1 py-1">
          <div className="flex items-center gap-2">
            {row.original.pinned ? <Pin className="size-3.5 text-rose-500" /> : null}
            <button
              type="button"
              onClick={() => action?.openPreview?.(row.original)}
              className="min-w-0 flex-1 truncate text-left font-medium text-slate-900 transition hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
              title={`${title} 미리보기`}
            >
              {title}
            </button>
          </div>
          <p className="line-clamp-2 text-xs text-slate-500">{row.original.summary}</p>
          <p className="text-[11px] text-slate-400">{row.original.author}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: '분류',
    size: 100,
    cell: ({ getValue }) => {
      const value = getValue<AnnouncementItem['category']>();

      return (
        <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700">
          {ANNOUNCEMENT_CATEGORY_LABELS[value]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'audience',
    header: '대상',
    size: 110,
    cell: ({ getValue }) => {
      const value = getValue<AnnouncementAudience>();

      return (
        <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700">
          {ANNOUNCEMENT_AUDIENCE_LABELS[value]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: '상태',
    size: 110,
    cell: ({ getValue }) => {
      const value = getValue<AnnouncementStatus>();

      return (
        <Badge variant="secondary" className={`rounded-full px-2.5 py-1 text-[11px] ${getStatusTone(value)}`}>
          {ANNOUNCEMENT_STATUS_LABELS[value]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'publishedAt',
    header: '게시 정보',
    size: 240,
    cell: ({ row }) => {
      const publishedAtText = row.original.publishedAt ? formatDateTime(row.original.publishedAt) : '-';
      const startAtText = row.original.startAt ? formatDateTime(row.original.startAt) : '-';
      const endAtText = row.original.endAt ? formatDateTime(row.original.endAt) : '-';

      return (
        <div className="flex flex-col gap-0.5 py-1 font-mono text-xs text-slate-600">
          <span>{`확정 ${publishedAtText}`}</span>
          <span className="text-[11px] text-slate-600">{`${startAtText} ~ ${endAtText}`}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: '수정 시각',
    size: 170,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-slate-600">
        {formatDateTime(getValue<string>())}
      </span>
    ),
  },
] satisfies ColumnDef<AnnouncementItem>[];

export function AnnouncementListTab() {
  const queryClient = useQueryClient();
  const announcementsQuery = useAnnouncementsControllerGetAnnouncementsV1();
  const announcements = (announcementsQuery.data?.data ?? []) as AnnouncementItem[];
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftAnnouncement, setDraftAnnouncement] = useState<AnnouncementEditorSeed | null>(null);
  const [editorKey, setEditorKey] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<AnnouncementItem | null>(null);
  const saveAnnouncementMutation = useAnnouncementsControllerCreateAnnouncementV1({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: announcementsQuery.queryKey });
      },
      onError: () => {
        toast.error('공지사항 저장에 실패했습니다.');
      },
    },
  });

  const handleOpenCreateEditor = () => {
    const nextAnnouncement = createBlankAnnouncement();
    setDraftAnnouncement(nextAnnouncement);
    setEditorKey(`editor-${Date.now()}`);
    setEditorOpen(true);
  };

  const handleEditorOpenChange = (open: boolean) => {
    setEditorOpen(open);

    if (!open) {
      setDraftAnnouncement(null);
    }
  };

  const handleSaveAnnouncement = async (announcement: Parameters<typeof saveAnnouncementMutation.mutateAsync>[0]['data']) => {
    await saveAnnouncementMutation.mutateAsync({ data: announcement });
  };

  const handleOpenPreview = (announcement: AnnouncementItem) => {
    setPreviewAnnouncement(announcement);
    setPreviewOpen(true);
  };

  const handleOpenEdit = (announcement: AnnouncementItem) => {
    setPreviewOpen(false);
    setPreviewAnnouncement(null);
    setDraftAnnouncement(announcement);
    setEditorKey(announcement.id);
    setEditorOpen(true);
  };

  const metaValue = {
    action: {
      openPreview: handleOpenPreview,
      openEdit: handleOpenEdit,
    },
  };

  const handlePreviewOpenChange = (open: boolean) => {
    setPreviewOpen(open);

    if (!open) {
      setPreviewAnnouncement(null);
    }
  };

  return (
    <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-slate-500">
            <Megaphone className="size-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">공지 목록</h2>
            <p className="text-sm text-slate-500">
              운영 공지를 한 화면에서 확인하고 새 공지를 추가할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2 lg:w-auto">
          <Button type="button" size="sm" onClick={handleOpenCreateEditor}>
            <Plus className="size-3.5" />
            추가
          </Button>
        </div>
      </header>

      <div className="flex-1 scroll px-4 py-4">
        <DataTable
          columns={ANNOUNCEMENT_COLUMNS}
          data={announcements}
          filterColumns={['title', 'summary', 'author', 'category', 'audience', 'status']}
          filterPlaceholder="제목, 요약, 작성자, 분류, 대상로 검색"
          meta={metaValue}
        />
      </div>

      {draftAnnouncement
        ? (
          <AnnouncementEditorModal
            key={editorKey}
            announcement={draftAnnouncement}
            open={editorOpen}
            onOpenChange={handleEditorOpenChange}
            onSave={handleSaveAnnouncement}
          />
        )
        : null}

      {previewAnnouncement
        ? (
          <AnnouncementPreviewModal
            announcement={previewAnnouncement}
            open={previewOpen}
            onOpenChange={handlePreviewOpenChange}
            onEdit={handleOpenEdit}
          />
        )
        : null}
    </section>
  );
}
