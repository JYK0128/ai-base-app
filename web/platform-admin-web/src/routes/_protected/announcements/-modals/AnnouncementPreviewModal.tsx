import '@toast-ui/editor/dist/toastui-editor.css';

import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@pkg/ui';
import { Viewer } from '@toast-ui/react-editor';
import { Eye } from 'lucide-react';

import type { AnnouncementPageItem } from '@/api/generated/model';

import { buildAnnouncementPreviewText, formatDateTime } from '../-helpers/announcements.helper';
import { ANNOUNCEMENT_AUDIENCE_LABELS, ANNOUNCEMENT_CATEGORY_LABELS, ANNOUNCEMENT_STATUS_LABELS } from '../-helpers/announcements-types.helper';

interface AnnouncementPreviewModalProps {
  readonly announcement: AnnouncementPageItem
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onEdit: (announcement: AnnouncementPageItem) => void
  readonly onDelete: (id: string) => void | Promise<void>
}

export function AnnouncementPreviewModal({ announcement, open, onOpenChange, onEdit, onDelete }: AnnouncementPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        grid h-[85vh] w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-white
        p-6
        sm:max-w-5xl!
      "
      >
        <DialogHeader className="border-b border-slate-200 pb-3">
          <DialogTitle className="
            flex items-center gap-2 text-lg font-bold tracking-tight
            text-slate-950
          "
          >
            <span className="
              rounded-xl border border-slate-200 bg-slate-50 p-1.5
              text-slate-500
            "
            >
              <Eye className="size-4" />
            </span>
            공지 미리보기
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            목록에서 선택한 공지의 내용을 미리 확인합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="scroll py-4 pr-1">
          <div className="
            grid gap-4
            lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]
          "
          >
            <section className="
              space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4
            "
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="
                      rounded-full border-slate-200 bg-white px-2.5 py-1
                      text-[11px] text-slate-700
                    "
                  >
                    {ANNOUNCEMENT_CATEGORY_LABELS[announcement.category]}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="
                      rounded-full border-slate-200 bg-white px-2.5 py-1
                      text-[11px] text-slate-700
                    "
                  >
                    {ANNOUNCEMENT_STATUS_LABELS[announcement.status]}
                  </Badge>
                </div>
                <h3 className="text-lg/snug font-semibold text-slate-950">
                  {announcement.title}
                </h3>
                <p className="line-clamp-2 text-sm text-slate-600">{buildAnnouncementPreviewText(announcement.content)}</p>
              </div>

              <div className="
                space-y-3 border-t border-slate-200 pt-3 text-sm text-slate-600
              "
              >
                <div className="space-y-1">
                  <div className="
                    text-[11px] tracking-[0.2em] text-slate-400 uppercase
                  "
                  >
                    대상
                  </div>
                  <div>{ANNOUNCEMENT_AUDIENCE_LABELS[announcement.audience]}</div>
                </div>
                <div className="space-y-1">
                  <div className="
                    text-[11px] tracking-[0.2em] text-slate-400 uppercase
                  "
                  >
                    게시 확정
                  </div>
                  <div className="font-mono text-xs text-slate-700">
                    {announcement.publishedAt ? formatDateTime(announcement.publishedAt) : '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="
                    text-[11px] tracking-[0.2em] text-slate-400 uppercase
                  "
                  >
                    게시 기간
                  </div>
                  <div className="space-y-0.5 font-mono text-xs text-slate-700">
                    <div>{announcement.startAt ? formatDateTime(announcement.startAt) : '-'}</div>
                    <div className="text-[11px] text-slate-700">
                      {announcement.endAt ? `~ ${formatDateTime(announcement.endAt)}` : '~ -'}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="
                    text-[11px] tracking-[0.2em] text-slate-400 uppercase
                  "
                  >
                    수정 시각
                  </div>
                  <div className="font-mono text-xs text-slate-700">{formatDateTime(announcement.updatedAt)}</div>
                </div>
              </div>
            </section>

            <section className="
              rounded-xl border border-slate-200 bg-white shadow-sm
            "
            >
              <div className="border-b border-slate-200 px-4 py-3">
                <div className="text-sm font-medium text-slate-500">본문</div>
              </div>
              <div className="scroll p-4 text-sm/7 text-slate-700">
                <Viewer key={announcement.id} initialValue={announcement.content} />
              </div>
            </section>
          </div>
        </div>

        <DialogFooter className="
          flex w-full items-center justify-between border-t border-slate-200
          pt-3
        "
        >
          <div>
            <Button type="button" variant="destructive" onClick={() => { void onDelete(announcement.id); }}>
              삭제
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onEdit(announcement)}>
              수정
            </Button>
            <Button type="button" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
