import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@pkg/ui';
import { FileText, Pencil, Trash2 } from 'lucide-react';

import { formatDateTime } from '../-helpers/terms-date.helper';
import { getVersionEffectiveTo, getVersionStatusPresentation, isEditableVersion, type ManagedTermsDocument, type ManagedTermsVersion } from '../-helpers/terms-management.helper';

interface TermsVersionDetailModalProps {
  readonly document: ManagedTermsDocument | null
  readonly onDelete?: () => void
  readonly open: boolean
  readonly onEdit: () => void
  readonly onOpenChange: (open: boolean) => void
  readonly version: ManagedTermsVersion | null
}

export function TermsVersionDetailModal({
  document,
  onDelete,
  open,
  onEdit,
  onOpenChange,
  version,
}: TermsVersionDetailModalProps) {
  const presentation = version ? getVersionStatusPresentation(version, document?.versions ?? []) : null;
  const effectiveTo = version ? getVersionEffectiveTo(version, document?.versions ?? []) : null;
  const editable = isEditableVersion(version ?? undefined, document?.document ?? null);
  const deletable = presentation?.tone === 'DRAFT' || presentation?.tone === 'SCHEDULED';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        grid h-[85vh] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto]
        overflow-hidden bg-white
        sm:max-w-[96vw]
      "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            약관 버전 상세
          </DialogTitle>
          <DialogDescription>
            선택한 버전의 메타데이터와 본문을 확인합니다.
          </DialogDescription>
        </DialogHeader>

        {!version
          ? (
            <div className="
              grid min-h-0 place-items-center rounded-xl border border-dashed
              border-slate-200 bg-slate-50 text-sm text-slate-500
            "
            >
              버전을 선택해 주세요.
            </div>
          )
          : (
            <div className="scroll-y h-full">
              <div className="space-y-4 pr-2 pb-1">
                <section className="
                  rounded-xl border border-slate-200 bg-white p-4
                "
                >
                  <div className="
                    flex flex-wrap items-start justify-between gap-3
                  "
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-950">{version.label}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {presentation?.label ?? version.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-500">
                        {document?.document.title ?? '-'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {editable ? '수정 가능' : '읽기 전용'}
                    </div>
                  </div>

                  <div className="
                    mt-4 grid gap-3
                    sm:grid-cols-2
                    xl:grid-cols-4
                  "
                  >
                    <div className="
                      rounded-lg border border-slate-100 bg-slate-50 p-3
                    "
                    >
                      <div className="text-xs text-slate-500">문서 코드</div>
                      <div className="
                        mt-1 truncate font-mono text-sm text-slate-900
                      "
                      >
                        {document?.document.code ?? '-'}
                      </div>
                    </div>
                    <div className="
                      rounded-lg border border-slate-100 bg-slate-50 p-3
                    "
                    >
                      <div className="text-xs text-slate-500">버전 ID</div>
                      <div className="
                        mt-1 truncate font-mono text-sm text-slate-900
                      "
                      >
                        {version.id}
                      </div>
                    </div>
                    <div className="
                      rounded-lg border border-slate-100 bg-slate-50 p-3
                    "
                    >
                      <div className="text-xs text-slate-500">효력 일시</div>
                      <div className="mt-1 text-sm text-slate-900">{formatDateTime(version.effectiveAt)}</div>
                    </div>
                    <div className="
                      rounded-lg border border-slate-100 bg-slate-50 p-3
                    "
                    >
                      <div className="text-xs text-slate-500">종료 일시</div>
                      <div className="mt-1 text-sm text-slate-900">{effectiveTo ? formatDateTime(effectiveTo) : '-'}</div>
                    </div>
                  </div>
                </section>

                <section className="
                  rounded-xl border border-slate-200 bg-white p-4
                "
                >
                  <div className="
                    text-xs font-semibold tracking-wide text-slate-500 uppercase
                  "
                  >
                    상태 해석
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    {presentation?.description ?? '-'}
                  </div>
                </section>

                <section className="
                  rounded-xl border border-slate-200 bg-white p-4
                "
                >
                  <div className="
                    text-xs font-semibold tracking-wide text-slate-500 uppercase
                  "
                  >
                    개정 요약
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    {version.summary ?? '등록된 요약이 없습니다.'}
                  </div>
                </section>

                <section className="
                  rounded-xl border border-slate-200 bg-white p-4
                "
                >
                  <div className="
                    text-xs font-semibold tracking-wide text-slate-500 uppercase
                  "
                  >
                    변경 사유
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    {version.reason ?? '등록된 사유가 없습니다.'}
                  </div>
                </section>

                <section className="
                  rounded-xl border border-slate-200 bg-slate-50 p-4
                "
                >
                  <div className="
                    text-xs font-semibold tracking-wide text-slate-500 uppercase
                  "
                  >
                    본문
                  </div>
                  <div className="
                    mt-3 rounded-lg border border-slate-200 bg-white p-4
                    text-sm/7 whitespace-pre-wrap text-slate-700
                  "
                  >
                    {version.content}
                  </div>
                </section>
              </div>
            </div>
          )}

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          {version && deletable && onDelete && (
            <Button type="button" variant="outline" className="gap-2" onClick={onDelete}>
              <Trash2 className="size-3.5" />
              삭제
            </Button>
          )}
          {version && editable && (
            <Button type="button" className="gap-2" onClick={onEdit}>
              <Pencil className="size-3.5" />
              수정
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
