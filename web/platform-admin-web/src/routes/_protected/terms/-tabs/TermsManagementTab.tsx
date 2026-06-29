import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ScrollArea } from '@pkg/ui';
import { FileText, Loader2, ScrollText } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useTermsControllerGetTermsDocumentListV1, useTermsControllerGetTermsDocumentV1 } from '@/api/generated/endpoints';
import type { GetTermDocumentDetailResponseDto, GetTermDocumentItem, TermsControllerGetTermsDocumentListV1Params } from '@/api/generated/model';
import { pickApiItems } from '@/lib/api-response';

import { type SessionContext, useSession } from '../../../../hooks/useSession';
import { formatDateTime } from '../-helpers/terms-date.helper';
import { getDocumentLifecycle, getVersionStatusPresentation, type TermsDocumentLifecycle, type TermsDocumentScope } from '../-helpers/terms-lifecycle.helper';

interface TermsManagementTabProps {
  readonly isActive?: boolean
}

function documentStatusTone(status: TermsDocumentLifecycle) {
  switch (status) {
    case 'DRAFT':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'ACTIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'TERMINATED':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'SCHEDULED_TERMINATION':
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

function scopeLabel(scope: TermsDocumentScope) {
  return scope === 'organization' ? '조직' : '플랫폼';
}

export function TermsManagementTab({ isActive = true }: TermsManagementTabProps) {
  const session: SessionContext = useSession();
  const organizationId = session.data?.organization?.id ?? null;
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');

  const termsDocumentsQueryParams = useMemo<TermsControllerGetTermsDocumentListV1Params>(() => ({
    filters: {
      scope: organizationId ? 'organization' : 'platform',
    },
  }), [organizationId]);

  const termsDocumentsQuery = useTermsControllerGetTermsDocumentListV1<GetTermDocumentItem[]>(termsDocumentsQueryParams, {
    query: {
      enabled: isActive,
      select: (response) => pickApiItems(response),
    },
  });

  const documents = termsDocumentsQuery.data ?? [];
  const effectiveSelectedDocumentId = selectedDocumentId || documents[0]?.id || '';
  const selectedDocumentDetailQuery = useTermsControllerGetTermsDocumentV1<GetTermDocumentDetailResponseDto>(effectiveSelectedDocumentId, {
    query: {
      enabled: !!effectiveSelectedDocumentId && isActive,
    },
  });
  const selectedDocumentDetail = selectedDocumentDetailQuery.data;

  if (!isActive) {
    return null;
  }

  if (termsDocumentsQuery.isLoading && documents.length === 0) {
    return (
      <div className="
        grid min-h-80 place-items-center rounded-xl border border-dashed
        border-slate-200 bg-white
      "
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          약관 문서를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  return (
    <div className="
      grid gap-4
      lg:grid-cols-[320px_minmax(0,1fr)]
    "
    >
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="size-4" />
            약관 문서
          </CardTitle>
          <CardDescription>
            생성된 API에는 조회만 포함되어 있어 관리 기능은 제공하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-135">
            <div className="space-y-2 p-3">
              {documents.map((document) => {
                const lifecycle = getDocumentLifecycle(document);
                const isSelected = document.id === effectiveSelectedDocumentId;

                return (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => setSelectedDocumentId(document.id)}
                    className={`
                      w-full rounded-lg border p-3 text-left transition
                      ${
                  isSelected
                    ? 'border-slate-300 bg-slate-50'
                    : `
                      border-slate-100 bg-white
                      hover:border-slate-200 hover:bg-slate-50
                    `
                  }
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{document.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {scopeLabel(document.organization ? 'organization' : 'platform')}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`
                          text-[10px]
                          ${documentStatusTone(lifecycle)}
                        `}
                      >
                        {lifecycle}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {document.code}
                      </span>
                    </div>
                  </button>
                );
              })}
              {documents.length === 0 && (
                <div className="
                  grid place-items-center rounded-lg border border-dashed
                  border-slate-200 bg-slate-50 py-12 text-sm text-slate-500
                "
                >
                  등록된 약관 문서가 없습니다.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            문서 상세
          </CardTitle>
          <CardDescription>
            선택한 문서의 현재 버전과 이력을 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {!effectiveSelectedDocumentId || !selectedDocumentDetail
            ? (
              <div className="
                grid min-h-90 place-items-center rounded-lg border border-dashed
                border-slate-200 bg-slate-50 text-sm text-slate-500
              "
              >
                문서를 선택해 주세요.
              </div>
            )
            : (
              <>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-950">
                        {selectedDocumentDetail.document.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {selectedDocumentDetail.document.code}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {selectedDocumentDetail.document.required ? '필수' : '선택'}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>
                      범위:
                      {' '}
                      {scopeLabel(selectedDocumentDetail.document.organization ? 'organization' : 'platform')}
                    </p>
                    <p>
                      상태:
                      {' '}
                      {getDocumentLifecycle(selectedDocumentDetail.document)}
                    </p>
                    <p>
                      종료 일시:
                      {' '}
                      {formatDateTime(selectedDocumentDetail.document.terminatedAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900">버전 목록</h4>
                  <div className="space-y-2">
                    {selectedDocumentDetail.versions.map((version) => {
                      const presentation = getVersionStatusPresentation(version, selectedDocumentDetail.versions);

                      return (
                        <div
                          key={version.id}
                          className="
                            rounded-lg border border-slate-200 bg-slate-50 p-3
                          "
                        >
                          <div className="
                            flex items-center justify-between gap-2
                          "
                          >
                            <span className="font-medium text-slate-900">{version.label}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {presentation.label}
                            </Badge>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            <p>
                              상태:
                              {' '}
                              {version.status}
                            </p>
                            <p>
                              효력 일시:
                              {' '}
                              {formatDateTime(version.effectiveAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
