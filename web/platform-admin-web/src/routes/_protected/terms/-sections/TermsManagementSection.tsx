/* eslint-disable sonarjs/cognitive-complexity */
import { Badge, Button, confirm, Input, toast } from '@pkg/ui';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, FilePlus2, Loader2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useTermsControllerCancelTermsDocumentTerminationV1,
         useTermsControllerCreateTermsDocumentV1,
         useTermsControllerCreateTermsDocumentVersionV1,
         useTermsControllerDeleteTermsDocumentV1,
         useTermsControllerDeleteTermsDocumentVersionV1,
         useTermsControllerGetTermsDocumentListV1,
         useTermsControllerGetTermsDocumentVersionsV1,
         useTermsControllerScheduleTermsDocumentTerminationV1,
         useTermsControllerUpdateTermsDocumentVersionV1 } from '@/api/generated/endpoints';
import { type CreateTermDocumentRequestDto,
         type GetTermDocumentItem,
         GetTermDocumentVersionItemStatus,
         type ScheduleTermDocumentTerminationRequestDto,
         type TermsControllerGetTermsDocumentListV1Params,
         type TermsControllerGetTermsDocumentVersionsV1Params,
         type UpdateTermDocumentVersionRequestDto } from '@/api/generated/model';
import { pickApiItems } from '@/lib/api-response';

import { type SessionContext, useSession } from '../../../../hooks/useSession';
import { ConsolePanel } from '../../-components/ConsolePanel';
import { formatDateTime, toIsoDateString } from '../-helpers/terms-date.helper';
import { createManagedDocument,
         documentStatusTone,
         getCurrentActivePublishedVersion,
         getDocumentLifecycle,
         getDocumentScopeLabel,
         getVersionEffectiveTo,
         getVersionStatusPresentation,
         isEditableVersion,
         type ManagedTermsDocument,
         type ManagedTermsVersion,
         type TermsDocumentScope } from '../-helpers/terms-management.helper';
import { TermsDocumentModal } from '../-modals/TermsDocumentModal';
import { TermsDocumentTerminationModal } from '../-modals/TermsDocumentTerminationModal';
import { TermsVersionDetailModal } from '../-modals/TermsVersionDetailModal';
import { TermsVersionModal } from '../-modals/TermsVersionModal';

interface TermsManagementSectionProps {
  readonly isActive?: boolean
}

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

function matchesVersion(
  version: ManagedTermsVersion,
  searchTerm: string,
): boolean {
  if (!searchTerm) return true;

  return [
    version.id,
    version.label,
    version.content,
    version.checksum,
    version.status,
    version.summary ?? '',
    version.reason ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(searchTerm);
}

function matchesDocument(
  record: ManagedTermsDocument,
  searchTerm: string,
): boolean {
  if (!searchTerm) return true;

  const terminatedAt = record.document.terminatedAt
    ? JSON.stringify(record.document.terminatedAt)
    : '';
  const documentTarget
    = `${record.document.code} ${record.document.title} ${record.document.status} ${record.document.organizationId ?? ''} ${terminatedAt} ${record.scope}`.toLowerCase();

  return (
    documentTarget.includes(searchTerm)
    || record.versions.some((version) => matchesVersion(version, searchTerm))
  );
}

export function TermsManagementSection({
  isActive = true,
}: TermsManagementSectionProps) {
  const queryClient = useQueryClient();
  const session: SessionContext = useSession();
  const organizationId
    = (session.data as { organization?: { id?: string } } | null)?.organization
      ?.id ?? null;

  const [activeScope, setActiveScope]
    = useState<TermsDocumentScope>('platform');
  const [searchText, setSearchText] = useState('');
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<
    Record<TermsDocumentScope, string>
  >({
    platform: '',
    organization: '',
  });
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isVersionDetailOpen, setIsVersionDetailOpen] = useState(false);
  const [versionEditor, setVersionEditor] = useState<{
    documentId: string
    scope: TermsDocumentScope
    versionId?: string | null
  } | null>(null);
  const [versionDetailId, setVersionDetailId] = useState('');

  const effectiveScope: TermsDocumentScope
    = organizationId || activeScope !== 'organization' ? activeScope : 'platform';
  const currentDocumentsQueryParams
    = useMemo<TermsControllerGetTermsDocumentListV1Params>(
      () => ({
        filters: {
          scope: effectiveScope,
        },
      }),
      [effectiveScope],
    );

  const currentDocumentsQuery = useTermsControllerGetTermsDocumentListV1<
    GetTermDocumentItem[]
  >(currentDocumentsQueryParams, {
    query: {
      enabled:
        isActive
        && (effectiveScope !== 'organization' || Boolean(organizationId)),
      placeholderData: undefined,
      select: (response) => pickApiItems(response),
    },
  });

  const createDocumentMutation = useTermsControllerCreateTermsDocumentV1();
  const createVersionMutation
    = useTermsControllerCreateTermsDocumentVersionV1();
  const deleteDocumentMutation = useTermsControllerDeleteTermsDocumentV1();
  const deleteVersionMutation
    = useTermsControllerDeleteTermsDocumentVersionV1();
  const scheduleTerminationMutation
    = useTermsControllerScheduleTermsDocumentTerminationV1();
  const cancelTerminationMutation
    = useTermsControllerCancelTermsDocumentTerminationV1();
  const updateVersionMutation
    = useTermsControllerUpdateTermsDocumentVersionV1();

  const remoteDocuments = useMemo(
    () =>
      currentDocumentsQuery.data?.map((document) =>
        createManagedDocument(document),
      ) ?? [],
    [currentDocumentsQuery.data],
  );
  const activeDocuments = remoteDocuments;
  const selectedDocumentId
    = selectedDocumentIds[effectiveScope]
      || activeDocuments[0]?.document.id
      || '';
  const selectedDocumentBase
    = activeDocuments.find(
      (record) => record.document.id === selectedDocumentId,
    ) ?? null;

  const selectedDocumentVersionsQueryParams
    = useMemo<TermsControllerGetTermsDocumentVersionsV1Params>(
      () => ({
        limit: 100,
        offset: 0,
      }),
      [],
    );
  const selectedDocumentVersionsQuery
    = useTermsControllerGetTermsDocumentVersionsV1<ManagedTermsVersion[]>(
      selectedDocumentBase?.document.id ?? '',
      selectedDocumentVersionsQueryParams,
      {
        query: {
          enabled:
            isActive
            && Boolean(selectedDocumentBase)
            && selectedDocumentBase?.origin === 'remote',
          placeholderData: undefined,
          select: (response) => pickApiItems(response) as ManagedTermsVersion[],
        },
      },
    );

  const selectedDocument
    = selectedDocumentBase && selectedDocumentVersionsQuery.data
      ? {
        ...selectedDocumentBase,
        versions: selectedDocumentVersionsQuery.data,
      }
      : selectedDocumentBase;

  const currentVersion = selectedDocument
    ? getCurrentActivePublishedVersion(selectedDocument.versions)
    : undefined;
  const filteredDocuments = useMemo(
    () =>
      activeDocuments.filter((record) =>
        matchesDocument(record, normalizeSearchTerm(searchText)),
      ),
    [activeDocuments, searchText],
  );
  const isOrganizationScopeAvailable = Boolean(organizationId);
  const selectedDocumentLifecycle = selectedDocument
    ? getDocumentLifecycle(selectedDocument.document)
    : null;
  const canHardDeleteDocument = Boolean(
    selectedDocument
    && selectedDocument.versions.length === 0,
  );
  const versionModalKey = versionEditor
    ? `${versionEditor.scope}:${versionEditor.documentId}:${versionEditor.versionId ?? 'create'}`
    : 'version-modal-empty';

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocumentIds((previous) => ({
      ...previous,
      [effectiveScope]: documentId,
    }));
  };

  const handleCreateDocument = async (payload: {
    code: string
    required: boolean
    scope: TermsDocumentScope
    title: string
  }) => {
    try {
      const requestData = {
        code: payload.code,
        required: payload.required,
        scope: payload.scope,
        title: payload.title,
      } satisfies CreateTermDocumentRequestDto;
      await createDocumentMutation.mutateAsync({
        data: requestData,
      });

      setSelectedDocumentIds((previous) => ({
        ...previous,
        [payload.scope]: '',
      }));
      setActiveScope(payload.scope);
      await queryClient.invalidateQueries({
        queryKey: ['/api/v1/terms/documents'],
      });
    }
    catch (error) {
      toast.error('약관 문서를 추가하지 못했습니다.');
      throw error;
    }
  };

  const handleOpenVersionCreate = () => {
    if (!selectedDocument || selectedDocumentLifecycle === 'TERMINATED') {
      return;
    }

    setVersionEditor({
      documentId: selectedDocument.document.id,
      scope: effectiveScope,
      versionId: null,
    });
    setIsVersionModalOpen(true);
  };

  const handleOpenVersionEdit = (version: ManagedTermsVersion) => {
    if (!selectedDocument || selectedDocumentLifecycle === 'TERMINATED') {
      return;
    }

    setVersionEditor({
      documentId: selectedDocument.document.id,
      scope: effectiveScope,
      versionId: version.id,
    });
    setVersionDetailId(version.id);
    setIsVersionDetailOpen(false);
    setIsVersionModalOpen(true);
  };

  const handleDeleteVersion = async () => {
    if (!selectedDocument || !versionDetailId) {
      return;
    }

    const isConfirmed = await confirm({
      title: '이 버전을 삭제할까요?',
      description: '임시저장 또는 예약 발효 버전만 삭제할 수 있습니다. 삭제 후 복구할 수 없습니다.',
      actionText: '삭제',
      cancelText: '취소',
    });

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteVersionMutation.mutateAsync({
        documentId: selectedDocument.document.id,
        versionId: versionDetailId,
      });

      await queryClient.invalidateQueries({
        queryKey: currentDocumentsQuery.queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: selectedDocumentVersionsQuery.queryKey,
      });
      setIsVersionDetailOpen(false);
      setVersionDetailId('');
    }
    catch (error) {
      toast.error('약관 버전을 삭제하지 못했습니다.');
      throw error;
    }
  };

  const handleSaveVersion = async (payload: {
    content: string
    effectiveAt: string
    label: string
    reason?: string
    status: 'DRAFT' | 'PUBLISHED'
    summary?: string
  }) => {
    if (!versionEditor || !selectedDocument) {
      return;
    }

    try {
      if (selectedDocument.origin === 'remote') {
        const requestData = {
          content: payload.content.trim(),
          effectiveAt: toIsoDateString(payload.effectiveAt),
          label: payload.label.trim(),
          reason: payload.reason?.trim() || undefined,
          status: payload.status,
          summary: payload.summary?.trim() || undefined,
        } satisfies UpdateTermDocumentVersionRequestDto;

        if (versionEditor.versionId) {
          await updateVersionMutation.mutateAsync({
            data: requestData,
            documentId: versionEditor.documentId,
            versionId: versionEditor.versionId,
          });
        }
        else {
          await createVersionMutation.mutateAsync({
            data: requestData,
            documentId: versionEditor.documentId,
          });
        }

        await queryClient.invalidateQueries({
          queryKey: currentDocumentsQuery.queryKey,
        });
        await queryClient.invalidateQueries({
          queryKey: selectedDocumentVersionsQuery.queryKey,
        });
      }
    }
    catch (error) {
      toast.error(
        versionEditor.versionId
          ? '약관 버전을 수정하지 못했습니다.'
          : '약관 버전을 추가하지 못했습니다.',
      );
      throw error;
    }
  };

  const handleOpenTermination = () => {
    if (!selectedDocument) {
      return;
    }

    setIsTerminationModalOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!canHardDeleteDocument || !selectedDocument) {
      return;
    }

    const isConfirmed = await confirm({
      title: '버전이 없는 문서입니다. 문서를 완전히 삭제할까요?',
      description: '삭제 후 복구할 수 없습니다.',
      actionText: '삭제',
      cancelText: '취소',
    });

    if (!isConfirmed) {
      return;
    }

    try {
      if (selectedDocument.origin === 'remote') {
        await deleteDocumentMutation.mutateAsync({
          documentId: selectedDocument.document.id,
        });

        await queryClient.invalidateQueries({
          queryKey: currentDocumentsQuery.queryKey,
        });
      }

      setSelectedDocumentIds((previous) => {
        return {
          ...previous,
          [effectiveScope]: '',
        };
      });
    }
    catch (error) {
      toast.error('버전이 없는 약관 문서를 삭제하지 못했습니다.');
      throw error;
    }
  };

  const handleSaveTermination = async (terminatedAt: string) => {
    if (!selectedDocument) {
      return;
    }

    try {
      if (selectedDocument.origin === 'remote') {
        await scheduleTerminationMutation.mutateAsync({
          data: {
            terminatedAt,
          } satisfies ScheduleTermDocumentTerminationRequestDto,
          documentId: selectedDocument.document.id,
        });

        await queryClient.invalidateQueries({
          queryKey: currentDocumentsQuery.queryKey,
        });
        await queryClient.invalidateQueries({
          queryKey: selectedDocumentVersionsQuery.queryKey,
        });
      }
    }
    catch (error) {
      toast.error('약관 문서를 폐기하지 못했습니다.');
      throw error;
    }
  };

  const handleCancelTermination = async () => {
    if (
      !selectedDocument
      || selectedDocumentLifecycle !== 'SCHEDULED_TERMINATION'
    ) {
      return;
    }

    try {
      if (selectedDocument.origin === 'remote') {
        await cancelTerminationMutation.mutateAsync({
          documentId: selectedDocument.document.id,
        });

        await queryClient.invalidateQueries({
          queryKey: currentDocumentsQuery.queryKey,
        });
        await queryClient.invalidateQueries({
          queryKey: selectedDocumentVersionsQuery.queryKey,
        });
      }
    }
    catch (error) {
      toast.error('약관 문서 폐기를 취소하지 못했습니다.');
      throw error;
    }
  };

  const isDocumentListLoading
    = currentDocumentsQuery.isLoading && activeDocuments.length === 0;
  const showCancelTerminationButton = Boolean(
    selectedDocument
    && selectedDocument.versions.length > 0
    && selectedDocumentLifecycle === 'SCHEDULED_TERMINATION',
  );
  const documentPrimaryAction = (() => {
    if (canHardDeleteDocument) {
      return (
        <Button
          key="delete-document"
          type="button"
          variant="outline"
          className="gap-2"
          disabled={!selectedDocument}
          onClick={() => void handleDeleteDocument()}
        >
          문서 삭제
        </Button>
      );
    }

    if (selectedDocumentLifecycle !== 'TERMINATED') {
      return (
        <Button
          key="terminate-document"
          type="button"
          variant="outline"
          className="gap-2"
          disabled={!selectedDocument}
          onClick={handleOpenTermination}
        >
          <Archive className="size-3.5" />
          {selectedDocumentLifecycle === 'SCHEDULED_TERMINATION'
            ? '폐기 예약됨'
            : '문서 폐기'}
        </Button>
      );
    }

    return (
      <Button
        key="restore-unavailable"
        type="button"
        variant="outline"
        className="gap-2"
        disabled
      >
        복구 불가
      </Button>
    );
  })();

  if (!isActive) {
    return null;
  }

  return (
    <>
      <TermsDocumentModal
        open={isDocumentModalOpen}
        onOpenChange={setIsDocumentModalOpen}
        scope={effectiveScope}
        onSave={handleCreateDocument}
      />

      <TermsDocumentTerminationModal
        open={isTerminationModalOpen}
        document={selectedDocument}
        onOpenChange={setIsTerminationModalOpen}
        onSave={handleSaveTermination}
      />

      <TermsVersionModal
        key={versionModalKey}
        document={selectedDocument}
        version={
          versionEditor?.versionId
            ? (selectedDocument?.versions.find(
              (version) => version.id === versionEditor.versionId,
            ) ?? null)
            : null
        }
        open={isVersionModalOpen}
        onOpenChange={(open) => {
          setIsVersionModalOpen(open);
          if (!open) {
            setVersionEditor(null);
          }
        }}
        onSave={handleSaveVersion}
      />

      <TermsVersionDetailModal
        document={selectedDocument}
        open={isVersionDetailOpen}
        onDelete={() => void handleDeleteVersion()}
        onOpenChange={(open) => {
          setIsVersionDetailOpen(open);
          if (!open) {
            setVersionDetailId('');
          }
        }}
        version={
          selectedDocument?.versions.find(
            (version) => version.id === versionDetailId,
          ) ?? null
        }
        onEdit={() => {
          const version = selectedDocument?.versions.find(
            (item) => item.id === versionDetailId,
          );
          if (
            version
            && selectedDocument
            && isEditableVersion(version, selectedDocument.document)
          ) {
            handleOpenVersionEdit(version);
          }
        }}
      />
      <div
        className="
          grid h-full min-h-0 gap-4
          lg:grid-cols-[360px_minmax(0,1fr)]
        "
      >
        <ConsolePanel
          icon="scroll-text"
          title="약관 문서"
          description="scope별 문서 목록을 확인하고 새 문서를 등록합니다."
          actions={[
            <Button
              key="create-document"
              className="gap-2"
              onClick={() => setIsDocumentModalOpen(true)}
            >
              <FilePlus2 className="size-3.5" />
              문서 추가
            </Button>,
          ]}
        >
          <div className="
            grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-4
          "
          >
            <div className="mx-auto flex w-full max-w-md gap-2">
              <Button
                type="button"
                variant={effectiveScope === 'platform' ? 'default' : 'outline'}
                className="flex-1 justify-center"
                onClick={() => setActiveScope('platform')}
              >
                플랫폼
              </Button>
              <Button
                type="button"
                variant={
                  effectiveScope === 'organization' ? 'default' : 'outline'
                }
                className="flex-1 justify-center"
                disabled={!isOrganizationScopeAvailable}
                onClick={() => setActiveScope('organization')}
              >
                조직
              </Button>
            </div>

            <div
              className="
                flex items-center gap-2 rounded-xl border border-slate-200
                bg-slate-50 px-3 py-2.5
              "
            >
              <Search className="size-4 text-slate-400" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="문서 제목, 코드, 버전 라벨, 본문, 상태를 검색합니다."
                className="
                  border-0 bg-transparent shadow-none
                  focus-visible:ring-0
                "
              />
            </div>

            {isDocumentListLoading
              ? (
                <div
                  className="
                    grid flex-1 place-items-center rounded-xl border
                    border-dashed border-slate-200 bg-white
                  "
                >
                  <div className="
                    flex items-center gap-2 text-sm text-slate-500
                  "
                  >
                    <Loader2 className="size-4 animate-spin" />
                    약관 문서를 불러오는 중입니다...
                  </div>
                </div>
              )
              : (
                <div className="scroll-y h-full pr-2">
                  <div className="space-y-2">
                    {filteredDocuments.map((record) => {
                      const lifecycle = getDocumentLifecycle(record.document);
                      const isSelected = record.document.id === selectedDocumentId;

                      return (
                        <button
                          key={record.document.id}
                          type="button"
                          onClick={() => handleSelectDocument(record.document.id)}
                          className={`
                            w-full rounded-xl border p-3 text-left transition
                            ${
                        isSelected
                          ? 'border-slate-300 bg-slate-50 shadow-sm'
                          : `
                            border-slate-100 bg-white
                            hover:border-slate-200 hover:bg-slate-50
                          `
                        }
                          `}
                        >
                          <div className="
                            flex items-start justify-between gap-3
                          "
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-950">
                                {record.document.title}
                              </div>
                              <div className="font-mono text-xs text-slate-500">
                                {record.document.code}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                              {getDocumentScopeLabel(record.scope)}
                            </Badge>
                          </div>

                          <div className="
                            mt-3 flex flex-wrap items-center gap-2
                          "
                          >
                            <Badge
                              variant="secondary"
                              className={`
                                text-[10px]
                                ${documentStatusTone(lifecycle)}
                              `}
                            >
                              {lifecycle}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {record.document.required ? '필수' : '선택'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {record.document.terminatedAt
                                ? `종료 ${formatDateTime(record.document.terminatedAt)}`
                                : '활성'}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {filteredDocuments.length === 0 && (
                      <div
                        className="
                          grid min-h-40 place-items-center rounded-xl border
                          border-dashed border-slate-200 bg-slate-50 text-sm
                          text-slate-500
                        "
                      >
                        검색 조건에 맞는 약관 문서가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </ConsolePanel>

        <ConsolePanel
          icon="pencil-line"
          title="문서 상세"
          description="선택한 문서의 상태와 버전 이력을 확인합니다."
          actions={[
            <Button
              key="create-version"
              type="button"
              variant="outline"
              className="gap-2"
              disabled={
                !selectedDocument || selectedDocumentLifecycle === 'TERMINATED'
              }
              onClick={handleOpenVersionCreate}
            >
              <FilePlus2 className="size-3.5" />
              버전 추가
            </Button>,
            documentPrimaryAction,
            showCancelTerminationButton
              ? (
                <Button
                  key="cancel-termination"
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={!selectedDocument}
                  onClick={() => void handleCancelTermination()}
                >
                  폐기 취소
                </Button>
              )
              : null,
          ]}
        >
          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4">
            {!selectedDocument
              ? (
                <div
                  className="
                    row-span-2 grid min-h-0 place-items-center rounded-xl border
                    border-dashed border-slate-200 bg-slate-50 text-sm
                    text-slate-500
                  "
                >
                  문서를 선택해 주세요.
                </div>
              )
              : (
                <>
                  <div className="
                    flex flex-wrap items-start justify-between gap-4
                  "
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-950">
                          {selectedDocument.document.title}
                        </h3>
                        <Badge variant="outline">
                          {selectedDocument.document.required ? '필수' : '선택'}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`
                            text-[10px]
                            ${documentStatusTone(getDocumentLifecycle(selectedDocument.document))}
                          `}
                        >
                          {getDocumentLifecycle(selectedDocument.document)}
                        </Badge>
                      </div>
                      {selectedDocument.document.terminatedAt && (
                        <div className="
                          flex items-center gap-1 text-sm text-slate-500
                        "
                        >
                          <span>종료</span>
                          <span>
                            {formatDateTime(
                              selectedDocument.document.terminatedAt,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className="
                        flex items-center justify-end gap-2 text-right text-xs
                        tracking-wide text-slate-500 uppercase
                      "
                    >
                      <span>현재 버전</span>
                      <span
                        className="
                          text-sm leading-none font-medium text-slate-900
                          normal-case
                        "
                      >
                        {currentVersion ? currentVersion.label : '없음'}
                      </span>
                    </div>
                  </div>

                  <div
                    className="
                      grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3
                      overflow-hidden
                    "
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-slate-900">
                        버전 타임라인
                      </h4>
                      <span className="text-xs text-slate-500">
                        {selectedDocument.versions.length}
                        개
                      </span>
                    </div>

                    {selectedDocumentVersionsQuery.isLoading
                      && selectedDocument.origin === 'remote'
                      ? (
                        <div
                          className="
                            grid min-h-0 place-items-center rounded-xl border
                            border-dashed border-slate-200 bg-slate-50 text-sm
                            text-slate-500
                          "
                        >
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            버전 목록을 불러오는 중입니다...
                          </div>
                        </div>
                      )
                      : (
                        <div className="scroll-y max-h-full min-h-0 pr-2">
                          <div className="space-y-3">
                            {selectedDocument.versions
                              .filter((version) =>
                                matchesVersion(
                                  version,
                                  normalizeSearchTerm(searchText),
                                ),
                              )
                              .map((version) => {
                                const presentation = getVersionStatusPresentation(
                                  version,
                                  selectedDocument.versions,
                                );
                                const isCurrent = currentVersion?.id === version.id;
                                const effectiveTo
                                  = version.status
                                    === GetTermDocumentVersionItemStatus.PUBLISHED
                                    ? getVersionEffectiveTo(
                                      version,
                                      selectedDocument.versions,
                                    )
                                    : null;

                                return (
                                  <button
                                    key={version.id}
                                    type="button"
                                    onClick={() => {
                                      setVersionDetailId(version.id);
                                      setIsVersionDetailOpen(true);
                                    }}
                                    className="
                                      w-full rounded-xl border border-slate-200
                                      bg-white p-4 text-left transition
                                      hover:border-slate-300 hover:bg-slate-50
                                    "
                                  >
                                    <div
                                      className="
                                        flex items-start justify-between gap-4
                                      "
                                    >
                                      <div className="min-w-0 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className="
                                              font-semibold text-slate-900
                                            "
                                          >
                                            {version.label}
                                          </span>
                                          {isCurrent && (
                                            <span
                                              className="
                                                text-xs font-medium
                                                text-emerald-700
                                              "
                                            >
                                              현재
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                          {presentation.description}
                                        </div>
                                      </div>
                                      <div
                                        className="
                                          shrink-0 text-right text-xs
                                          text-slate-500
                                        "
                                      >
                                        {presentation.label}
                                      </div>
                                    </div>

                                    <div
                                      className="
                                        mt-4 flex flex-wrap gap-2 text-xs
                                        text-slate-500
                                      "
                                    >
                                      <span>
                                        효력
                                        {formatDateTime(version.effectiveAt)}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        종료
                                        {effectiveTo
                                          ? formatDateTime(effectiveTo)
                                          : '-'}
                                      </span>
                                      <span>•</span>
                                      <span
                                        className="
                                          truncate font-mono text-slate-500
                                        "
                                      >
                                        {version.checksum}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}

                            {selectedDocument.versions.filter((version) =>
                              matchesVersion(
                                version,
                                normalizeSearchTerm(searchText),
                              ),
                            ).length === 0 && (
                              <div
                                className="
                                  grid min-h-40 place-items-center rounded-xl
                                  border border-dashed border-slate-200
                                  bg-slate-50 text-sm text-slate-500
                                "
                              >
                                검색 조건에 맞는 버전이 없습니다.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}
          </div>
        </ConsolePanel>
      </div>
    </>
  );
}
