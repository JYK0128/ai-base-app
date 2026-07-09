import { Badge, Button, type ColumnDef, confirm, DataTable, toast } from '@pkg/ui';
import { useQueryClient } from '@tanstack/react-query';
import { Pin, Plus } from 'lucide-react';
import { useState } from 'react';

import { useAnnouncementControllerCreateAnnouncementV1, useAnnouncementControllerDeleteAnnouncementV1, useAnnouncementControllerGetAnnouncementPageV1, useAnnouncementControllerUpdateAnnouncementV1 } from '@/api/generated/endpoints';
import type { AnnouncementPageItem, AnnouncementPageItemAudience, AnnouncementPageItemCategory, AnnouncementPageItemStatus, CreateAnnouncementRequestDto, UpdateAnnouncementRequestDto } from '@/api/generated/model';

import { ConsolePanel } from '../../-components/ConsolePanel';
import { buildAnnouncementPreviewText, createBlankAnnouncement, formatDateTime, toAnnouncementEditorSeed } from '../-helpers/announcements.helper';
import { ANNOUNCEMENT_AUDIENCE_LABELS, ANNOUNCEMENT_CATEGORY_LABELS, ANNOUNCEMENT_STATUS_LABELS, type AnnouncementEditorSeed } from '../-helpers/announcements-types.helper';
import { AnnouncementEditorModal } from '../-modals/AnnouncementEditorModal';
import { AnnouncementPreviewModal } from '../-modals/AnnouncementPreviewModal';

function getStatusTone(status: AnnouncementPageItemStatus) {
  switch (status) {
    case 'DRAFT':
      return 'border-slate-200 bg-slate-100 text-slate-700';
    case 'SCHEDULED':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'ACTIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'EXPIRED':
      return 'border-rose-200 bg-rose-50 text-rose-700';
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
              className="
                min-w-0 flex-1 truncate text-left font-medium text-slate-900
                transition
                hover:text-sky-600
                focus-visible:ring-2 focus-visible:ring-sky-200
                focus-visible:outline-none
              "
              title={`${title} 미리보기`}
            >
              {title}
            </button>
          </div>
          <p className="line-clamp-2 text-xs text-slate-500">{buildAnnouncementPreviewText(row.original.content)}</p>
          <p className="text-[11px] text-slate-400">{`작성자 ${row.original.author}`}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: '분류',
    size: 100,
    cell: ({ getValue }) => {
      const value = getValue<AnnouncementPageItemCategory>();

      return (
        <Badge
          variant="outline"
          className="
            rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px]
            text-slate-700
          "
        >
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
      const value = getValue<AnnouncementPageItemAudience>();

      return (
        <Badge
          variant="outline"
          className="
            rounded-full border-slate-200 bg-white px-2.5 py-1 text-[11px]
            text-slate-700
          "
        >
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
      const value = getValue<AnnouncementPageItemStatus>();

      return (
        <Badge
          variant="secondary"
          className={`
            rounded-full px-2.5 py-1 text-[11px]
            ${getStatusTone(value)}
          `}
        >
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
        <div className="
          flex flex-col gap-0.5 py-1 font-mono text-xs text-slate-600
        "
        >
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
] satisfies ColumnDef<AnnouncementPageItem>[];

export function AnnouncementListSection() {
  const queryClient = useQueryClient();
  const announcementsQuery = useAnnouncementControllerGetAnnouncementPageV1({
    filters: {},
    page: 1,
    limit: 100,
  });

  const announcements = (announcementsQuery.data?.items ?? []);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftAnnouncement, setDraftAnnouncement] = useState<AnnouncementEditorSeed | null>(null);
  const [editorKey, setEditorKey] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<AnnouncementPageItem | null>(null);
  const saveAnnouncementMutation = useAnnouncementControllerCreateAnnouncementV1({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: announcementsQuery.queryKey });
      },
    },
  });

  const updateAnnouncementMutation = useAnnouncementControllerUpdateAnnouncementV1({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: announcementsQuery.queryKey });
      },
    },
  });

  const deleteAnnouncementMutation = useAnnouncementControllerDeleteAnnouncementV1({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: announcementsQuery.queryKey });
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

  const handleSaveAnnouncement = async (announcement: CreateAnnouncementRequestDto | UpdateAnnouncementRequestDto) => {
    if ('id' in announcement) {
      await updateAnnouncementMutation.mutateAsync({ id: announcement.id, data: announcement });
    }
    else {
      await saveAnnouncementMutation.mutateAsync({ data: announcement });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const confirmed = await confirm({
      title: '공지사항을 삭제할까요?',
      description: '삭제한 공지사항은 복구할 수 없습니다.',
      actionText: '삭제',
      cancelText: '취소',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteAnnouncementMutation.mutateAsync({ id });
      toast.success('공지사항이 삭제되었습니다.');
      setPreviewOpen(false);
      setPreviewAnnouncement(null);
    }
    catch {
      // Parent mutation handles error toast
    }
  };

  const handleOpenPreview = (announcement: AnnouncementPageItem) => {
    setPreviewAnnouncement(announcement);
    setPreviewOpen(true);
  };

  const handleOpenEdit = (announcement: AnnouncementPageItem) => {
    setPreviewOpen(false);
    setPreviewAnnouncement(null);
    setDraftAnnouncement(toAnnouncementEditorSeed(announcement));
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
    <div className="flex min-h-0 flex-1 flex-col">
      <ConsolePanel
        icon="megaphone"
        title="공지 목록"
        description="운영 공지를 한 화면에서 확인하고 새 공지를 추가할 수 있습니다."
        actions={[
          <Button key="create" type="button" size="sm" onClick={handleOpenCreateEditor}>
            <Plus className="size-3.5" />
            추가
          </Button>,
        ]}
      >
        <DataTable
          columns={ANNOUNCEMENT_COLUMNS}
          data={announcements}
          filterColumns={['title', 'content', 'category', 'audience', 'status']}
          filterPlaceholder="제목, 내용, 분류, 대상으로 검색"
          meta={metaValue}
        />
      </ConsolePanel>

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
            onDelete={handleDeleteAnnouncement}
          />
        )
        : null}
    </div>
  );
}
