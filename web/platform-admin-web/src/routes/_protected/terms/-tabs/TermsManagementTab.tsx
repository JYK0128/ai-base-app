import { Badge, Button, type CellContext, type ColumnDef, DataTable, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, FileText, Loader2, Plus, ScrollText, Shield } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { getTermsControllerGetTermsDocumentsV1QueryKey,
         getTermsControllerGetTermsDocumentV1QueryKey,
         useTermsControllerCancelDeprecationTermsDocumentV1,
         useTermsControllerCreateTermsDocumentV1,
         useTermsControllerCreateTermsVersionV1,
         useTermsControllerDeleteTermsDocumentV1,
         useTermsControllerDeprecateTermsDocumentV1,
         useTermsControllerGetTermsDocumentsV1,
         useTermsControllerGetTermsDocumentV1,
         useTermsControllerUpdateTermsVersionV1 } from '../../../../api/endpoints';
import { CancelDeprecationTermsDocumentDto,
         CreateTermsDocumentDto,
         CreateTermsVersionDto,
         CreateTermsVersionDtoStatus,
         type CreateTermsVersionDtoStatus as CreateTermsVersionDtoStatusType,
         DeleteTermsDocumentDto,
         DeprecateTermsDocumentDto,
         TermsControllerGetTermsDocumentsV1Scope,
         UpdateTermsVersionDto,
         UpdateTermsVersionDtoStatus,
         type UpdateTermsVersionDtoStatus as UpdateTermsVersionDtoStatusType } from '../../../../api/model';
import { useAuth } from '../../../../hooks/useAuth';
import { defaultTermsVersionEffectiveAtInput,
         type ExtendedTermsDocumentResponseDto,
         type ExtendedTermsVersionResponseDto,
         formatDateTime,
         getCurrentActivePublishedVersion,
         getDocumentLifecycle,
         getVersionEffectiveTo,
         getVersionStatusPresentation,
         isDocumentCurrentlyDeprecated,
         isEditableVersion,
         scopeLabel,
         type TermsDocumentLifecycle,
         type TermsDocumentScope,
         toDatetimeLocalValue,
         toIsoDateString,
         type VersionComputedStatus } from '../-terms.shared';

type CreateTermsDocumentFormValues = {
  code: string
  required: boolean
  scope: TermsDocumentScope
  title: string
};

type CreateTermsVersionFormValues = {
  content: string
  effectiveAt: string
  label: string
  status: CreateTermsVersionDtoStatusType
};

type UpdateTermsVersionFormValues = {
  content: string
  effectiveAt: string
  label: string
  status: UpdateTermsVersionDtoStatusType
};

const TERMS_VERSION_STATUS_OPTIONS: Array<{ label: string, value: CreateTermsVersionDtoStatusType }> = [
  { label: '임시저장', value: CreateTermsVersionDtoStatus.DRAFT },
  { label: '게시', value: CreateTermsVersionDtoStatus.PUBLISHED },
];

const TERMS_VERSION_FORM_SCHEMA = z.object({
  content: z.string().trim().min(1, '약관 본문을 입력해 주세요.'),
  effectiveAt: z.string().trim().min(1, '효력 시각을 입력해 주세요.'),
  label: z.string().trim().min(1, '버전 라벨을 입력해 주세요.'),
  status: z.enum([
    CreateTermsVersionDtoStatus.DRAFT,
    CreateTermsVersionDtoStatus.PUBLISHED,
  ]),
});

const FOOTER_PRIMARY_BUTTON_CLASS = 'min-w-24';

type DocumentRemovalMode = 'DEPRECATE' | 'DELETE';

function documentStatusTone(status: TermsDocumentLifecycle) {
  switch (status) {
    case 'DRAFT':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'ACTIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'DEPRECATED':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'SCHEDULED_DEPRECATION':
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

function versionStatusTone(status: VersionComputedStatus) {
  switch (status) {
    case 'DRAFT':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'ACTIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'SCHEDULED':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    case 'HISTORICAL':
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
}

function buildTermsDocumentListContent(params: {
  documents: ExtendedTermsDocumentResponseDto[]
  isLoading: boolean
  onSelect: (documentId: string) => void
  selectedDocumentId: string
}): ReactNode {
  const { documents, isLoading, onSelect, selectedDocumentId } = params;

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50/50 text-[10px] text-slate-400">
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        약관 문서를 불러오는 중입니다...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded border border-dashed border-slate-200 bg-slate-50/50 px-3 py-6 text-center text-[10px] text-slate-400">
        등록된 약관 문서가 없습니다.
      </div>
    );
  }

  return (
    <>
      {documents.map((document) => {
        const isSelected = document.id === selectedDocumentId;
        const scope = scopeLabel(document.organizationId);
        const lifecycle = getDocumentLifecycle(document);
        const lifecycleLabel = {
          DRAFT: 'DRAFT',
          ACTIVE: 'PUBLISHED',
          DEPRECATED: 'DEPRECATED',
          SCHEDULED_DEPRECATION: '폐기 예약',
        }[lifecycle];

        return (
          <button
            key={document.id}
            type="button"
            onClick={() => onSelect(document.id)}
            className={`relative flex w-full flex-none flex-col items-start gap-2 rounded border p-3 text-left transition-colors duration-150 ${
              isSelected
                ? 'border-slate-300 bg-slate-50'
                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className={`text-xs font-bold tracking-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                {document.title}
              </span>
              <Badge variant="secondary" className="rounded bg-slate-100 px-1.5 py-0 font-mono text-[9px] text-slate-500">
                {document.code}
              </Badge>
            </div>

            <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-400">
              {scope}
              {' '}
              약관
              {lifecycle === 'SCHEDULED_DEPRECATION' && document.deprecatedAt && (
                <span className="ml-1.5 text-[9px] text-amber-600 font-semibold">{`(${new Date(document.deprecatedAt).toLocaleDateString()} 폐기 예정)`}</span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[9px] font-medium">
              <Badge variant="outline" className="rounded border-slate-200 bg-white px-1.5 py-0 text-slate-600">
                {scope}
              </Badge>
              <Badge variant="outline" className={`rounded px-1.5 py-0 ${document.required ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                {document.required ? '필수' : '선택'}
              </Badge>
              <Badge variant="outline" className={`rounded px-1.5 py-0 ${documentStatusTone(lifecycle)}`}>
                {lifecycleLabel}
              </Badge>
            </div>
          </button>
        );
      })}
    </>
  );
}

// eslint-disable-next-line sonarjs/cognitive-complexity -- this screen intentionally consolidates document, version, and modal flows
export function TermsManagementTab() {
  const { organizationId } = useAuth();
  const queryClient = useQueryClient();
  const [termsDocumentsQueryParams, termsDocumentQueryKey] = useMemo(() => {
    const params = {
      scope: organizationId
        ? TermsControllerGetTermsDocumentsV1Scope.organization
        : TermsControllerGetTermsDocumentsV1Scope.platform,
    };
    return [params, getTermsControllerGetTermsDocumentsV1QueryKey(params)] as const;
  }, [organizationId]);

  const [selectedDocumentScope, setSelectedDocumentScope] = useState<TermsDocumentScope>(
    organizationId ? 'organization' : 'platform',
  );
  const [selectedTermsDocumentId, setSelectedTermsDocumentId] = useState<string>('');
  const [lastSelectedTermsDocumentIdsByScope, setLastSelectedTermsDocumentIdsByScope] = useState<Record<TermsDocumentScope, string>>({
    organization: '',
    platform: '',
  });
  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false);
  const [isCreateVersionModalOpen, setIsCreateVersionModalOpen] = useState(false);
  const [isVersionDetailOpen, setIsVersionDetailOpen] = useState(false);
  const [isUpdateVersionModalOpen, setIsUpdateVersionModalOpen] = useState(false);
  const [selectedVersionToUpdate, setSelectedVersionToUpdate] = useState<ExtendedTermsVersionResponseDto | undefined>(undefined);
  const [isDeprecateConfirmOpen, setIsDeprecateConfirmOpen] = useState(false);
  const [documentRemovalMode, setDocumentRemovalMode] = useState<DocumentRemovalMode>('DEPRECATE');
  const [deprecateType, setDeprecateType] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [scheduledDeprecateDate, setScheduledDeprecateDate] = useState('');
  const visibleSelectedDocumentScope = organizationId ? selectedDocumentScope : 'platform';

  const termsDocumentsQuery = useTermsControllerGetTermsDocumentsV1(termsDocumentsQueryParams, {
    query: {
      enabled: true,
    },
  });
  const termsDocuments = useMemo<ExtendedTermsDocumentResponseDto[]>(
    () => termsDocumentsQuery.data?.data ?? [],
    [termsDocumentsQuery.data?.data],
  );

  const platformTermsDocuments = useMemo(
    () => termsDocuments.filter((document) => !document.organizationId),
    [termsDocuments],
  );
  const organizationTermsDocuments = useMemo(
    () => termsDocuments.filter((document) => !!document.organizationId),
    [termsDocuments],
  );
  const activeTermsDocuments = visibleSelectedDocumentScope === 'organization'
    ? organizationTermsDocuments
    : platformTermsDocuments;
  const effectiveSelectedTermsDocumentId = useMemo(() => {
    if (selectedTermsDocumentId && activeTermsDocuments.some((document) => document.id === selectedTermsDocumentId)) {
      return selectedTermsDocumentId;
    }

    const rememberedId = lastSelectedTermsDocumentIdsByScope[visibleSelectedDocumentScope];
    if (rememberedId && activeTermsDocuments.some((document) => document.id === rememberedId)) {
      return rememberedId;
    }

    return activeTermsDocuments[0]?.id ?? '';
  }, [activeTermsDocuments, lastSelectedTermsDocumentIdsByScope, selectedTermsDocumentId, visibleSelectedDocumentScope]);

  const selectedTermsDocumentFromList = useMemo(
    () => termsDocuments.find((document) => document.id === effectiveSelectedTermsDocumentId),
    [effectiveSelectedTermsDocumentId, termsDocuments],
  );

  const selectedTermsDocumentDetailQuery = useTermsControllerGetTermsDocumentV1(effectiveSelectedTermsDocumentId, {
    query: {
      enabled: !!effectiveSelectedTermsDocumentId,
    },
  });
  const selectedTermsDocumentDetail = effectiveSelectedTermsDocumentId ? selectedTermsDocumentDetailQuery.data?.data : undefined;

  const selectedTermsDocument = selectedTermsDocumentDetail?.document ?? selectedTermsDocumentFromList;
  const selectedTermsVersionPreviews = useMemo<ExtendedTermsVersionResponseDto[]>(
    () => selectedTermsDocumentDetail?.versions ?? [],
    [selectedTermsDocumentDetail?.versions],
  );
  const selectedTermsDocumentCurrentVersion = selectedTermsDocumentDetail?.currentVersion ?? getCurrentActivePublishedVersion(selectedTermsVersionPreviews);
  const selectedTermsDocumentHasCurrentEffectiveVersion = !!selectedTermsDocumentCurrentVersion;
  const selectedTermsDocumentLifecycle = getDocumentLifecycle(selectedTermsDocument);
  const isSelectedDocumentLoading = !!effectiveSelectedTermsDocumentId && selectedTermsDocumentDetailQuery.isLoading && !selectedTermsDocumentDetail;

  const createDocumentScopeItems = useMemo(
    () => [
      {
        label: '플랫폼',
        value: 'platform',
        disabled: visibleSelectedDocumentScope === 'organization',
      },
      {
        label: '조직',
        value: 'organization',
        disabled: visibleSelectedDocumentScope === 'platform' || !organizationId,
      },
    ],
    [organizationId, visibleSelectedDocumentScope],
  );

  const invalidateTermsDocumentList = async () => {
    await queryClient.invalidateQueries({ queryKey: termsDocumentQueryKey });
  };

  const invalidateSelectedTermsDocument = async (documentId = selectedTermsDocument?.id ?? effectiveSelectedTermsDocumentId) => {
    if (!documentId) return;
    await queryClient.invalidateQueries({ queryKey: getTermsControllerGetTermsDocumentV1QueryKey(documentId) });
  };

  const createDocumentMutation = useTermsControllerCreateTermsDocumentV1();
  const createVersionMutation = useTermsControllerCreateTermsVersionV1();
  const updateVersionMutation = useTermsControllerUpdateTermsVersionV1();
  const deprecateDocumentMutation = useTermsControllerDeprecateTermsDocumentV1();
  const cancelDeprecationMutation = useTermsControllerCancelDeprecationTermsDocumentV1();
  const deleteDocumentMutation = useTermsControllerDeleteTermsDocumentV1();

  const createDocumentForm = useAppForm({
    defaultValues: {
      code: '',
      required: true,
      scope: selectedDocumentScope,
      title: '',
    } as CreateTermsDocumentFormValues,
    validators: {
      onSubmit: z.object({
        code: z.string().trim().min(1, '약관 문서 코드를 입력해 주세요.').transform((value) => value.toUpperCase().replace(/\s+/g, '_')),
        required: z.boolean(),
        scope: z.enum(['platform', 'organization']),
        title: z.string().trim().min(1, '약관 문서 제목을 입력해 주세요.'),
      }),
    },
    onSubmit: async ({ value }) => {
      const normalizedCode = value.code.trim().toUpperCase().replace(/\s+/g, '_');
      const normalizedTitle = value.title.trim();

      if (termsDocuments.some((document) => document.code === normalizedCode)) {
        toast.error('이미 존재하는 약관 문서 코드입니다.');
        return;
      }

      if (value.scope === 'organization' && !organizationId) {
        toast.error('조직 약관은 조직 컨텍스트에서만 생성할 수 있습니다.');
        return;
      }

      const payload: CreateTermsDocumentDto = {
        code: normalizedCode,
        title: normalizedTitle,
        required: value.required,
        scope: value.scope,
      };

      try {
        const response = await createDocumentMutation.mutateAsync({ data: payload });
        const createdDocument = response.data;
        if (!createdDocument) {
          toast.error('약관 문서를 생성하지 못했습니다.');
          return;
        }

        setSelectedDocumentScope(createdDocument.organizationId ? 'organization' : 'platform');
        setSelectedTermsDocumentId(createdDocument.id);
        createDocumentForm.reset();
        createDocumentForm.setFieldValue('required', true);
        createDocumentForm.setFieldValue('scope', createdDocument.organizationId ? 'organization' : 'platform');
        setIsCreateDocumentModalOpen(false);

        await invalidateTermsDocumentList();
        await invalidateSelectedTermsDocument(createdDocument.id);
        toast.success('약관 문서가 생성되었습니다.');
      }
      catch {
        toast.error('약관 문서를 생성하지 못했습니다.');
      }
    },
  });

  useEffect(() => {
    if (!isCreateDocumentModalOpen) return;

    createDocumentForm.setFieldValue('scope', visibleSelectedDocumentScope);
    createDocumentForm.setFieldValue('required', true);
  }, [createDocumentForm, isCreateDocumentModalOpen, visibleSelectedDocumentScope]);

  const createVersionForm = useAppForm({
    defaultValues: {
      content: '',
      effectiveAt: defaultTermsVersionEffectiveAtInput(),
      label: '',
      status: CreateTermsVersionDtoStatus.DRAFT,
    } as CreateTermsVersionFormValues,
    validators: {
      onChange: TERMS_VERSION_FORM_SCHEMA,
      onSubmit: TERMS_VERSION_FORM_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      if (!selectedTermsDocument) {
        toast.error('버전을 생성할 약관 문서를 선택해 주세요.');
        return;
      }

      if (isDocumentCurrentlyDeprecated(selectedTermsDocument)) {
        toast.error('폐기된 문서는 수정할 수 없습니다.');
        return;
      }

      const payload: CreateTermsVersionDto = {
        termsDocumentId: selectedTermsDocument.id,
        label: value.label.trim(),
        content: value.content.trim(),
        effectiveAt: toIsoDateString(value.effectiveAt),
        status: value.status,
      };

      try {
        const response = await createVersionMutation.mutateAsync({ data: payload });
        if (!response.data) {
          toast.error('약관 버전을 생성하지 못했습니다.');
          return;
        }

        createVersionForm.reset();
        createVersionForm.setFieldValue('status', CreateTermsVersionDtoStatus.DRAFT);
        createVersionForm.setFieldValue('effectiveAt', defaultTermsVersionEffectiveAtInput());
        setIsCreateVersionModalOpen(false);

        await invalidateTermsDocumentList();
        await invalidateSelectedTermsDocument(selectedTermsDocument.id);
        toast.success('약관 버전이 생성되었습니다.');
      }
      catch {
        toast.error('약관 버전을 생성하지 못했습니다.');
      }
    },
  });

  const updateVersionForm = useAppForm({
    defaultValues: {
      content: '',
      effectiveAt: defaultTermsVersionEffectiveAtInput(),
      label: '',
      status: UpdateTermsVersionDtoStatus.DRAFT,
    } as UpdateTermsVersionFormValues,
    validators: {
      onChange: TERMS_VERSION_FORM_SCHEMA,
      onSubmit: TERMS_VERSION_FORM_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      if (!selectedTermsDocument || !selectedVersionToUpdate) {
        toast.error('수정할 대상을 찾을 수 없습니다.');
        return;
      }

      if (isDocumentCurrentlyDeprecated(selectedTermsDocument)) {
        toast.error('폐기된 문서는 수정할 수 없습니다.');
        return;
      }

      const payload: UpdateTermsVersionDto = {
        id: selectedVersionToUpdate.id,
        label: value.label.trim(),
        content: value.content.trim(),
        effectiveAt: toIsoDateString(value.effectiveAt),
        status: value.status,
      };

      try {
        const response = await updateVersionMutation.mutateAsync({ data: payload });
        if (!response.data) {
          toast.error('약관 버전을 수정하지 못했습니다.');
          return;
        }

        setIsUpdateVersionModalOpen(false);
        setSelectedVersionToUpdate(undefined);

        await invalidateTermsDocumentList();
        await invalidateSelectedTermsDocument(selectedTermsDocument.id);
        toast.success('약관 버전이 수정되었습니다.');
      }
      catch {
        toast.error('약관 버전을 수정하지 못했습니다.');
      }
    },
  });

  const isCreatingDocument = useStore(createDocumentForm.baseStore, (state) => state.isSubmitting);
  const isCreatingVersion = useStore(createVersionForm.baseStore, (state) => state.isSubmitting);
  const isUpdatingVersion = useStore(updateVersionForm.baseStore, (state) => state.isSubmitting);
  const isSaving = isCreatingDocument
    || isCreatingVersion
    || isUpdatingVersion
    || deprecateDocumentMutation.isPending
    || cancelDeprecationMutation.isPending
    || deleteDocumentMutation.isPending;
  const selectedScopeLabel = scopeLabel(selectedTermsDocument?.organizationId ?? null);
  const hasSelectedDocument = !!selectedTermsDocument;
  const isSelectedDocumentDeprecated = selectedTermsDocumentLifecycle === 'DEPRECATED';
  const versionFormDisabled = !hasSelectedDocument || isCreatingVersion || isSelectedDocumentDeprecated;
  const selectedVersionToUpdateResolved = useMemo(() => {
    if (!selectedVersionToUpdate) return undefined;

    return selectedTermsVersionPreviews.some((version) => version.id === selectedVersionToUpdate.id)
      ? selectedVersionToUpdate
      : undefined;
  }, [selectedTermsVersionPreviews, selectedVersionToUpdate]);
  const selectedVersionStatusPresentation = selectedVersionToUpdateResolved
    ? getVersionStatusPresentation(selectedVersionToUpdateResolved, selectedTermsVersionPreviews)
    : undefined;
  const selectedVersionChecksum = selectedVersionToUpdateResolved?.checksum ?? 'a1b2c3d4';
  const editableSelectedVersion = hasSelectedDocument && !isSelectedDocumentDeprecated && isEditableVersion(selectedVersionToUpdateResolved)
    ? selectedVersionToUpdateResolved
    : undefined;
  const selectedDocumentRemovalActionLabel = selectedTermsDocumentHasCurrentEffectiveVersion ? '문서 폐기' : '문서 삭제';
  const selectedDocumentRemovalDialogTitle = documentRemovalMode === 'DELETE'
    ? '약관 문서 삭제 경고'
    : '약관 문서 폐기 경고';
  const selectedDocumentRemovalDialogDescription = documentRemovalMode === 'DELETE'
    ? '현재 효력 중인 약관이 없어 이 문서는 물리 삭제됩니다. 되돌릴 수 없으며 연결된 버전 이력도 함께 제거됩니다.'
    : '약관 문서를 폐기하면 되돌릴 수 없으며, 모든 버전 관리가 즉시 차단(읽기 전용)됩니다.';
  let selectedDocumentRemovalActionText = '즉시 폐기';
  if (documentRemovalMode === 'DELETE') {
    selectedDocumentRemovalActionText = '물리 삭제';
  }
  else if (deprecateType === 'SCHEDULED') {
    selectedDocumentRemovalActionText = '예약 폐기';
  }

  const handleSelectDocument = (documentId: string) => {
    const document = termsDocuments.find((item) => item.id === documentId);
    if (!document) return;

    setSelectedDocumentScope(document.organizationId ? 'organization' : 'platform');
    setSelectedTermsDocumentId(documentId);
    setLastSelectedTermsDocumentIdsByScope((current) => ({
      ...current,
      [document.organizationId ? 'organization' : 'platform']: documentId,
    }));
    setSelectedVersionToUpdate(undefined);
    setIsVersionDetailOpen(false);
    setIsUpdateVersionModalOpen(false);
    setIsDeprecateConfirmOpen(false);
  };

  const handleDocumentScopeChange = (value: string) => {
    const nextScope = value as TermsDocumentScope;
    const nextDocuments = nextScope === 'organization' ? organizationTermsDocuments : platformTermsDocuments;
    const rememberedId = lastSelectedTermsDocumentIdsByScope[nextScope];
    let nextDocumentId = '';

    if (selectedTermsDocumentId && nextDocuments.some((document) => document.id === selectedTermsDocumentId)) {
      nextDocumentId = selectedTermsDocumentId;
    }
    else if (rememberedId && nextDocuments.some((document) => document.id === rememberedId)) {
      nextDocumentId = rememberedId;
    }
    else {
      nextDocumentId = nextDocuments[0]?.id ?? '';
    }

    setSelectedDocumentScope(nextScope);
    setSelectedTermsDocumentId(nextDocumentId);
    setLastSelectedTermsDocumentIdsByScope((current) => ({ ...current, [nextScope]: nextDocumentId }));
    setSelectedVersionToUpdate(undefined);
    setIsVersionDetailOpen(false);
    setIsUpdateVersionModalOpen(false);
    setIsDeprecateConfirmOpen(false);
  };

  const handleDeprecateDocument = () => {
    if (!selectedTermsDocument) return;
    setDocumentRemovalMode(selectedTermsDocumentHasCurrentEffectiveVersion ? 'DEPRECATE' : 'DELETE');
    setDeprecateType('IMMEDIATE');
    setScheduledDeprecateDate('');
    setIsDeprecateConfirmOpen(true);
  };

  const handleConfirmDeprecate = async () => {
    if (!selectedTermsDocument) return;
    const documentId = selectedTermsDocument.id;

    try {
      if (documentRemovalMode === 'DELETE') {
        const payload: DeleteTermsDocumentDto = { id: documentId };
        const response = await deleteDocumentMutation.mutateAsync({ data: payload });
        if (!response.data && response.success === false) {
          toast.error('약관 문서를 삭제하지 못했습니다.');
          return;
        }

        setSelectedTermsDocumentId('');
        setSelectedVersionToUpdate(undefined);
        setIsVersionDetailOpen(false);
        setIsUpdateVersionModalOpen(false);
        setIsDeprecateConfirmOpen(false);

        await invalidateTermsDocumentList();
        await invalidateSelectedTermsDocument(documentId);
        toast.success('현재 효력 중인 약관이 없어 문서를 물리 삭제했습니다.');
        return;
      }

      if (deprecateType === 'SCHEDULED' && !scheduledDeprecateDate) {
        toast.error('예약 폐기 일시를 선택해 주세요.');
        return;
      }

      const payload: DeprecateTermsDocumentDto = {
        id: documentId,
        deprecatedAt: toIsoDateString(deprecateType === 'IMMEDIATE' ? new Date().toISOString() : scheduledDeprecateDate),
      };
      const response = await deprecateDocumentMutation.mutateAsync({ data: payload });
      if (!response.data && response.success === false) {
        toast.error('약관 문서를 폐기하지 못했습니다.');
        return;
      }

      setIsDeprecateConfirmOpen(false);
      await invalidateTermsDocumentList();
      await invalidateSelectedTermsDocument(documentId);

      toast.success(
        deprecateType === 'IMMEDIATE'
          ? '약관 문서가 즉시 폐기되었습니다.'
          : '약관 문서 폐기가 예약되었습니다.',
      );
    }
    catch {
      toast.error('약관 문서 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCancelDeprecation = async () => {
    if (!selectedTermsDocument) return;

    try {
      const payload: CancelDeprecationTermsDocumentDto = { id: selectedTermsDocument.id };
      const response = await cancelDeprecationMutation.mutateAsync({ data: payload });
      if (!response.data && response.success === false) {
        toast.error('폐기 예약을 취소하지 못했습니다.');
        return;
      }

      await invalidateTermsDocumentList();
      await invalidateSelectedTermsDocument(selectedTermsDocument.id);
      toast.success('폐기 예약이 취소되었습니다.');
    }
    catch {
      toast.error('폐기 예약 취소 중 오류가 발생했습니다.');
    }
  };

  const handleOpenVersionUpdate = (version: ExtendedTermsVersionResponseDto) => {
    if (!selectedTermsDocument || isDocumentCurrentlyDeprecated(selectedTermsDocument)) {
      toast.error('폐기된 문서는 수정할 수 없습니다.');
      return;
    }

    if (!isEditableVersion(version)) {
      toast.error('현재 상태의 버전은 수정할 수 없습니다.');
      return;
    }

    setSelectedVersionToUpdate(version);
    updateVersionForm.reset();
    updateVersionForm.setFieldValue('label', version.versionLabel);
    updateVersionForm.setFieldValue('content', version.content);
    updateVersionForm.setFieldValue('effectiveAt', toDatetimeLocalValue(version.effectiveAt));
    updateVersionForm.setFieldValue('status', version.status);
    setIsVersionDetailOpen(false);
    setIsUpdateVersionModalOpen(true);
  };

  const handleCreateDocumentModalOpenChange = (open: boolean) => {
    setIsCreateDocumentModalOpen(open);

    if (open) {
      createDocumentForm.reset();
      createDocumentForm.setFieldValue('scope', visibleSelectedDocumentScope);
      createDocumentForm.setFieldValue('required', true);
    }
  };

  const handleCreateVersionModalOpenChange = (open: boolean) => {
    setIsCreateVersionModalOpen(open);

    if (open) {
      createVersionForm.reset();
      createVersionForm.setFieldValue('status', CreateTermsVersionDtoStatus.DRAFT);
      createVersionForm.setFieldValue('effectiveAt', defaultTermsVersionEffectiveAtInput());
    }
  };

  const columns = [
    {
      accessorKey: 'versionLabel',
      header: '버전 정보',
      size: 140,
      cell: ({ row }: CellContext<ExtendedTermsVersionResponseDto, unknown>) => {
        const version = row.original;
        const checksum = version.checksum ?? 'a1b2c3d4';

        return (
          <button
            type="button"
            title="버전 상세 보기"
            aria-label={`버전 ${version.versionLabel} 상세 보기`}
            className="group flex w-full min-w-0 flex-col items-start gap-0.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-indigo-50 focus-visible:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            onClick={() => {
              setSelectedVersionToUpdate(version);
              setIsVersionDetailOpen(true);
            }}
          >
            <span className="truncate text-xs font-bold text-indigo-700 transition-colors group-hover:text-indigo-800">
              {version.versionLabel}
            </span>
            <p className="font-mono text-[9px] text-slate-400">
              {`sha256:${checksum}`}
            </p>
          </button>
        );
      },
    },
    {
      id: 'effectiveDate',
      header: '발효 일시',
      size: 220,
      cell: ({ row, table }: CellContext<ExtendedTermsVersionResponseDto, unknown>) => {
        const version = row.original;
        const effectiveTo = getVersionEffectiveTo(version, table.options.data);
        const startText = formatDateTime(version.effectiveAt);
        const endText = formatDateTime(effectiveTo);

        return (
          <div className="flex flex-col gap-0.5 py-1 font-mono text-[10px] text-slate-600">
            <span>{`시작: ${startText}`}</span>
            <span>{`종료: ${endText}`}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'content',
      header: '개정 요약 및 변경 사유',
      size: 300,
      cell: ({ getValue }: CellContext<ExtendedTermsVersionResponseDto, unknown>) => (
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{getValue() as string}</p>
      ),
    },
    {
      id: 'historyDates',
      header: '개정 이력 일정',
      size: 210,
      cell: ({ row, table }: CellContext<ExtendedTermsVersionResponseDto, unknown>) => {
        const allVersions = table.options.data;
        const version = row.original;
        const statusPresentation = getVersionStatusPresentation(version, allVersions);

        return (
          <div className="flex flex-col gap-0.5 py-1 font-mono text-[10px] text-slate-600">
            <span className="text-slate-500">{`효력 시각: ${formatDateTime(version.effectiveAt)}`}</span>
            <span className={versionStatusTone(statusPresentation.tone)}>
              {statusPresentation.description}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      size: 110,
      cell: ({ row, table }: CellContext<ExtendedTermsVersionResponseDto, unknown>) => {
        const allVersions = table.options.data;
        const version = row.original;
        const statusPresentation = getVersionStatusPresentation(version, allVersions);

        return (
          <Badge variant="outline" className={`rounded px-1.5 py-0 text-[10px] font-bold ${versionStatusTone(statusPresentation.tone)}`}>
            {statusPresentation.label}
          </Badge>
        );
      },
    },
  ] satisfies ColumnDef<ExtendedTermsVersionResponseDto>[];

  let documentMainContent: ReactNode;
  if (!hasSelectedDocument) {
    documentMainContent = (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">
        왼쪽 목록에서 약관 문서를 선택해 주세요.
      </div>
    );
  }
  else if (isSelectedDocumentLoading) {
    documentMainContent = (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        약관 버전 정보를 불러오는 중입니다...
      </div>
    );
  }
  else {
    documentMainContent = (
      <DataTable
        columns={columns}
        data={selectedTermsVersionPreviews}
        filterColumns={['versionLabel', 'content', 'status']}
        filterPlaceholder="버전 라벨, 본문, 상태로 검색..."
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-6 overflow-hidden">
      <div className="grid flex-1 w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="flex flex-col gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm lg:col-span-4 xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="space-y-0.5">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <ScrollText className="h-3.5 w-3.5 text-indigo-500" />
                약관 문서 목록
              </h2>
              <p className="text-[10px] text-slate-400">
                {organizationId ? '조직에 연결된 활성 약관 문서' : '플랫폼에 연결된 활성 약관 문서'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={() => setIsCreateDocumentModalOpen(true)}
                disabled={isSaving || (visibleSelectedDocumentScope === 'organization' && !organizationId)}
              >
                <Plus className="h-3 w-3" />
                추가
              </Button>
            </div>
          </div>

          <Tabs value={visibleSelectedDocumentScope} onValueChange={handleDocumentScopeChange} className="flex flex-1 flex-col gap-3">
            <TabsList className="w-fit justify-start" variant="line">
              <TabsTrigger value="platform" className="flex-none gap-2 px-4">
                <span>플랫폼</span>
                <Badge variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-500">
                  {platformTermsDocuments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex-none gap-2 px-4" disabled={!organizationId}>
                <span>조직</span>
                <Badge variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-500">
                  {organizationTermsDocuments.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="platform" className="mt-0 flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-2 scroll-y pr-0.5">
                {buildTermsDocumentListContent({
                  documents: platformTermsDocuments,
                  isLoading: termsDocumentsQuery.isLoading,
                  onSelect: handleSelectDocument,
                  selectedDocumentId: effectiveSelectedTermsDocumentId,
                })}
              </div>
            </TabsContent>

            <TabsContent value="organization" className="mt-0 flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-2 scroll-y pr-0.5">
                {buildTermsDocumentListContent({
                  documents: organizationTermsDocuments,
                  isLoading: termsDocumentsQuery.isLoading,
                  onSelect: handleSelectDocument,
                  selectedDocumentId: effectiveSelectedTermsDocumentId,
                })}
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        <main className="flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-8 xl:col-span-9">
          <header className="flex flex-col gap-4 border-b border-slate-150 bg-slate-50/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedTermsDocument?.title ?? '약관 관리'}
                </h2>
              </div>
              <p className="text-[10px] text-slate-400">
                선택한 약관 문서의 버전을 관리하고 초안을 등록합니다.
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              {isSaving && (
                <span className="mr-1 flex items-center gap-1 text-[10px] font-semibold text-amber-600 animate-pulse">
                  <AlertCircle className="h-3 w-3" />
                  저장 중
                </span>
              )}
              {hasSelectedDocument && isSelectedDocumentLoading && (
                <span className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  상세 불러오는 중
                </span>
              )}
              {hasSelectedDocument && !isSelectedDocumentLoading && !isSelectedDocumentDeprecated && getDocumentLifecycle(selectedTermsDocument) !== 'SCHEDULED_DEPRECATION' && (
                <>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      handleDeprecateDocument();
                    }}
                    disabled={isSaving}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {selectedDocumentRemovalActionLabel}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateVersionModalOpen(true)}
                    disabled={isSaving}
                  >
                    <Plus className="h-3 w-3" />
                    버전 추가
                  </Button>
                </>
              )}
              {hasSelectedDocument && !isSelectedDocumentLoading && getDocumentLifecycle(selectedTermsDocument) === 'SCHEDULED_DEPRECATION' && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-amber-700">
                    <AlertCircle className="h-3 w-3 animate-pulse" />
                    {`폐기 예약 (${new Date(selectedTermsDocument.deprecatedAt).toLocaleDateString()} 예정)`}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void handleCancelDeprecation();
                    }}
                    disabled={isSaving}
                  >
                    예약 취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateVersionModalOpen(true)}
                    disabled={isSaving}
                  >
                    <Plus className="h-3 w-3" />
                    버전 추가
                  </Button>
                </div>
              )}
              {hasSelectedDocument && !isSelectedDocumentLoading && isSelectedDocumentDeprecated && (
                <span className="flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-rose-700">
                  <AlertCircle className="h-3 w-3 animate-pulse" />
                  이 문서는 폐기되었습니다 (읽기 전용)
                </span>
              )}
            </div>
          </header>

          <div className="flex-1 flex flex-col p-5">
            {documentMainContent}
          </div>
        </main>
      </div>

      <Dialog open={isCreateDocumentModalOpen} onOpenChange={handleCreateDocumentModalOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <FileText className="h-4 w-4 text-indigo-500" />
              약관 문서 생성
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              새 약관 문서의 코드, 제목, 유형, 필수 여부를 입력합니다.
            </DialogDescription>
          </DialogHeader>

          <createDocumentForm.AppForm>
            <createDocumentForm.Layout className="space-y-4 pt-2" onSubmit={(event) => void createDocumentForm.handleSubmit(event)}>
              <createDocumentForm.AppField name="scope">
                {(field) => (
                  <field.RadioGroup
                    className="w-fit ml-auto"
                    label={<span className="text-sm font-semibold text-slate-900">유형</span>}
                    required
                    orientation="horizontal"
                    labelWidth="auto"
                    items={createDocumentScopeItems}
                  />
                )}
              </createDocumentForm.AppField>

              <createDocumentForm.AppField name="code">
                {(field) => (
                  <field.Input
                    label="문서 코드"
                    placeholder="예: SERVICE_TOS"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                  />
                )}
              </createDocumentForm.AppField>

              <createDocumentForm.AppField name="title">
                {(field) => (
                  <field.Input
                    label="문서 제목"
                    placeholder="예: 서비스 이용약관"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                  />
                )}
              </createDocumentForm.AppField>

              <createDocumentForm.AppField name="required">
                {(field) => (
                  <field.Checkbox
                    label={<span className="font-semibold text-slate-900">필수 약관</span>}
                    orientation="horizontal"
                  />
                )}
              </createDocumentForm.AppField>

              <DialogFooter className="border-t border-slate-200 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateDocumentModalOpenChange(false)}
                >
                  취소
                </Button>
                <createDocumentForm.Submit className={FOOTER_PRIMARY_BUTTON_CLASS}>
                  {isCreatingDocument
                    ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin" />
                        저장 중...
                      </span>
                    )
                    : '저장'}
                </createDocumentForm.Submit>
              </DialogFooter>
            </createDocumentForm.Layout>
          </createDocumentForm.AppForm>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateVersionModalOpen} onOpenChange={handleCreateVersionModalOpenChange}>
        <DialogContent className="grid h-[85vh] w-full grid-rows-[auto_1fr] overflow-hidden sm:max-w-5xl!">
          <DialogHeader className="border-b border-slate-200 pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-950">
              <span className="rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-slate-500">
                <Shield className="size-4 text-indigo-500" />
              </span>
              약관 버전 초안 생성
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              선택한 약관 문서에 연결될 새 버전 초안을 작성합니다.
            </DialogDescription>
          </DialogHeader>

          <createVersionForm.AppForm>
            <createVersionForm.Layout className="grid h-full grid-rows-[minmax(0,1fr)_auto]" onSubmit={(event) => void createVersionForm.handleSubmit(event)}>
              <div className="scroll py-4 pr-1">
                <div className="grid gap-6">
                  {selectedTermsDocument && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs leading-5 text-slate-500">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-200">
                          {selectedTermsDocument.code}
                        </Badge>
                        <span className="font-semibold text-slate-700">
                          {selectedTermsDocument.title}
                        </span>
                        <Badge variant="outline" className="rounded border-indigo-200 bg-indigo-50/50 px-1.5 py-0 text-[10px] font-bold text-indigo-700">
                          {selectedScopeLabel}
                          {' '}
                          약관
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        위 선택된 약관 문서에 종속될 새 버전 정보와 발효 시각, 규정 본문을 입력합니다.
                      </p>
                    </div>
                  )}

                  <createVersionForm.FieldSet className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <createVersionForm.FieldLegend className="px-1 text-sm font-semibold text-slate-900">
                      기본 정보
                    </createVersionForm.FieldLegend>

                    <createVersionForm.FieldGroup className="mt-4 grid gap-4">
                      <createVersionForm.AppField name="label">
                        {(field) => (
                          <field.Input
                            label="버전 라벨"
                            placeholder="예: v1.0.0"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            disabled={versionFormDisabled}
                          />
                        )}
                      </createVersionForm.AppField>

                      <createVersionForm.AppField name="effectiveAt">
                        {(field) => (
                          <field.Input
                            label="효력 시각 (발효 시점)"
                            type="datetime-local"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            step={60}
                            disabled={versionFormDisabled}
                          />
                        )}
                      </createVersionForm.AppField>

                      <createVersionForm.AppField name="status">
                        {(field) => (
                          <field.Select
                            label="버전 상태"
                            placeholder="상태를 선택하세요"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            items={TERMS_VERSION_STATUS_OPTIONS}
                            disabled={versionFormDisabled}
                          />
                        )}
                      </createVersionForm.AppField>
                    </createVersionForm.FieldGroup>
                  </createVersionForm.FieldSet>

                  <createVersionForm.FieldSet className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <createVersionForm.FieldLegend className="px-1 text-sm font-semibold text-slate-900">
                      본문
                    </createVersionForm.FieldLegend>

                    <createVersionForm.FieldGroup className="mt-4 grid gap-4">
                      <createVersionForm.AppField name="content">
                        {(field) => (
                          <field.Textarea
                            label="약관 본문"
                            placeholder="법무적 효력을 가질 약관의 전체 조항을 상세히 기술하세요."
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            rows={12}
                            disabled={versionFormDisabled}
                          />
                        )}
                      </createVersionForm.AppField>
                    </createVersionForm.FieldGroup>
                  </createVersionForm.FieldSet>
                </div>
              </div>

              <DialogFooter className="border-t border-slate-200 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateVersionModalOpenChange(false)}
                >
                  취소
                </Button>
                <createVersionForm.Submit className={FOOTER_PRIMARY_BUTTON_CLASS} disabled={versionFormDisabled}>
                  {isCreatingVersion
                    ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin" />
                        저장 중...
                      </span>
                    )
                    : '저장'}
                </createVersionForm.Submit>
              </DialogFooter>
            </createVersionForm.Layout>
          </createVersionForm.AppForm>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeprecateConfirmOpen} onOpenChange={setIsDeprecateConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-sm font-bold text-rose-600">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              {selectedDocumentRemovalDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {selectedDocumentRemovalDialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {documentRemovalMode === 'DELETE'
              ? (
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-slate-600">
                  <p className="font-semibold text-rose-800">현재 효력 중인 약관이 없어 물리 삭제됩니다.</p>
                  <p className="mt-1 text-[11px] text-slate-500">문서와 연결된 버전 이력도 함께 제거되며 되돌릴 수 없습니다.</p>
                </div>
              )
              : (
                <>
                  <label className="block font-semibold text-slate-700">폐기 처리 방식</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeprecateType('IMMEDIATE')}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 transition-all ${deprecateType === 'IMMEDIATE' ? 'border-rose-300 bg-rose-50 text-rose-700 font-semibold shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span>즉시 폐기</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeprecateType('SCHEDULED')}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 transition-all ${deprecateType === 'SCHEDULED' ? 'border-amber-300 bg-amber-50/70 text-amber-800 font-semibold shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span>예약 폐기</span>
                    </button>
                  </div>

                  {deprecateType === 'SCHEDULED'
                    ? (
                      <div className="space-y-1.5 pt-1">
                        <label className="block font-semibold text-slate-700">예약 일시 설정</label>
                        <input
                          type="datetime-local"
                          value={scheduledDeprecateDate}
                          onChange={(e) => setScheduledDeprecateDate(e.target.value)}
                          required
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    )
                    : (
                      <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-slate-600">
                        <p className="font-semibold text-rose-800">정말 즉시 폐기하시겠습니까?</p>
                        <p className="mt-1 text-[11px] text-slate-500">즉시 읽기 전용 상태로 잠기며 되돌릴 수 없습니다.</p>
                      </div>
                    )}
                </>
              )}
          </div>

          <DialogFooter className="border-t border-slate-200 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeprecateConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void handleConfirmDeprecate();
              }}
              className={FOOTER_PRIMARY_BUTTON_CLASS}
            >
              {selectedDocumentRemovalActionText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isVersionDetailOpen} onOpenChange={setIsVersionDetailOpen}>
        <DialogContent className="grid h-[85vh] w-full grid-rows-[auto_1fr] overflow-hidden sm:max-w-4xl!">
          <DialogHeader className="border-b border-slate-200 pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-950">
              <span className="rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-slate-500">
                <ScrollText className="size-4 text-indigo-500" />
              </span>
              약관 버전 상세
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              선택한 버전의 메타데이터와 본문을 확인한 뒤 수정으로 이동할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="scroll py-4 pr-1">
            {selectedVersionToUpdateResolved && selectedTermsDocument
              ? (
                <div className="grid gap-4">
                  <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-200">
                        {selectedTermsDocument.code}
                      </Badge>
                      <span className="font-semibold text-slate-700">
                        {selectedTermsDocument.title}
                      </span>
                      <Badge variant="outline" className="rounded border-indigo-200 bg-indigo-50/50 px-1.5 py-0 text-[10px] font-bold text-indigo-700">
                        {selectedScopeLabel}
                        {' '}
                        약관
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {selectedVersionStatusPresentation?.description ?? '선택한 버전의 상세 정보를 확인합니다.'}
                    </p>
                  </section>

                  <section className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        버전 라벨
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {selectedVersionToUpdateResolved.versionLabel}
                        </span>
                        {selectedVersionStatusPresentation && (
                          <Badge variant="outline" className={`rounded px-1.5 py-0 text-[10px] font-bold ${versionStatusTone(selectedVersionStatusPresentation.tone)}`}>
                            {selectedVersionStatusPresentation.label}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-slate-400">
                        {`sha256:${selectedVersionChecksum}`}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        효력 시각
                      </div>
                      <div className="mt-2 space-y-1 font-mono text-sm font-semibold text-indigo-600">
                        <div>{`시작: ${formatDateTime(selectedVersionToUpdateResolved.effectiveAt)}`}</div>
                        <div>{`종료: ${formatDateTime(getVersionEffectiveTo(selectedVersionToUpdateResolved, selectedTermsVersionPreviews))}`}</div>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        게시 및 발효 기준 시점과 다음 버전 시작 시점을 함께 표시합니다.
                      </p>
                    </div>
                  </section>

                  <section className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        버전 ID
                      </div>
                      <div className="mt-2 break-all font-mono text-xs text-slate-600">
                        {selectedVersionToUpdateResolved.id}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        상태
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className={`rounded px-1.5 py-0 text-[10px] font-bold ${versionStatusTone(selectedVersionStatusPresentation?.tone ?? 'HISTORICAL')}`}>
                          {selectedVersionStatusPresentation?.label ?? '이전 버전'}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        수정 가능 여부
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {editableSelectedVersion ? '수정 가능' : '읽기 전용'}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {isSelectedDocumentDeprecated
                          ? '폐기된 문서는 수정할 수 없습니다.'
                          : '임시저장 초안과 예약 발효 전 버전은 수정할 수 있습니다.'}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          약관 본문
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {selectedVersionStatusPresentation?.description ?? '선택한 버전의 본문입니다.'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                      {selectedVersionToUpdateResolved.content}
                    </div>
                  </section>

                  {isSelectedDocumentDeprecated
                    ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-5 text-rose-700">
                        폐기된 문서는 버전을 수정할 수 없습니다.
                      </div>
                    )
                    : !editableSelectedVersion && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-700">
                        이미 발효된 버전은 읽기 전용입니다. 수정하려면 임시저장 초안 또는 예약 발효 전 버전을 선택해 주세요.
                      </div>
                    )}
                </div>
              )
              : (
                <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">
                  버전 상세 정보를 불러올 수 없습니다.
                </div>
              )}
          </div>

          <DialogFooter className="border-t border-slate-200 pt-3">
            {editableSelectedVersion && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenVersionUpdate(editableSelectedVersion)}
              >
                수정
              </Button>
            )}
            <Button
              type="button"
              onClick={() => setIsVersionDetailOpen(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateVersionModalOpen && !isSelectedDocumentDeprecated} onOpenChange={setIsUpdateVersionModalOpen}>
        <DialogContent className="grid h-[85vh] w-full grid-rows-[auto_1fr] overflow-hidden sm:max-w-5xl!">
          <DialogHeader className="border-b border-slate-200 pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-950">
              <span className="rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-slate-500">
                <Shield className="size-4 text-indigo-500" />
              </span>
              약관 버전 수정
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              임시저장 초안과 예약 발효 전 버전의 상세 정보와 규정 본문을 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <updateVersionForm.AppForm>
            <updateVersionForm.Layout className="grid h-full grid-rows-[minmax(0,1fr)_auto]" onSubmit={(event) => void updateVersionForm.handleSubmit(event)}>
              <div className="scroll py-4 pr-1">
                <div className="grid gap-6">
                  {selectedTermsDocument && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs leading-5 text-slate-500">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-200">
                          {selectedTermsDocument.code}
                        </Badge>
                        <span className="font-semibold text-slate-700">
                          {selectedTermsDocument.title}
                        </span>
                        <Badge variant="outline" className="rounded border-indigo-200 bg-indigo-50/50 px-1.5 py-0 text-[10px] font-bold text-indigo-700">
                          {selectedScopeLabel}
                          {' '}
                          약관
                        </Badge>
                      </div>
                    </div>
                  )}

                  <updateVersionForm.FieldSet className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <updateVersionForm.FieldLegend className="px-1 text-sm font-semibold text-slate-900">
                      기본 정보
                    </updateVersionForm.FieldLegend>

                    <updateVersionForm.FieldGroup className="mt-4 grid gap-4">
                      <updateVersionForm.AppField name="label">
                        {(field) => (
                          <field.Input
                            label="버전 라벨"
                            placeholder="예: v1.0.0"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                          />
                        )}
                      </updateVersionForm.AppField>

                      <updateVersionForm.AppField name="effectiveAt">
                        {(field) => (
                          <field.Input
                            label="효력 시각 (발효 시점)"
                            type="datetime-local"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            step={60}
                          />
                        )}
                      </updateVersionForm.AppField>

                      <updateVersionForm.AppField name="status">
                        {(field) => (
                          <field.Select
                            label="버전 상태"
                            placeholder="상태를 선택하세요"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            items={TERMS_VERSION_STATUS_OPTIONS}
                          />
                        )}
                      </updateVersionForm.AppField>
                    </updateVersionForm.FieldGroup>
                  </updateVersionForm.FieldSet>

                  <updateVersionForm.FieldSet className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <updateVersionForm.FieldLegend className="px-1 text-sm font-semibold text-slate-900">
                      본문
                    </updateVersionForm.FieldLegend>

                    <updateVersionForm.FieldGroup className="mt-4 grid gap-4">
                      <updateVersionForm.AppField name="content">
                        {(field) => (
                          <field.Textarea
                            label="약관 본문"
                            placeholder="법무적 효력을 가질 약관의 전체 조항을 상세히 기술하세요."
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            rows={12}
                          />
                        )}
                      </updateVersionForm.AppField>
                    </updateVersionForm.FieldGroup>
                  </updateVersionForm.FieldSet>
                </div>
              </div>

              <DialogFooter className="border-t border-slate-200 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateVersionModalOpen(false)}
                >
                  취소
                </Button>
                <updateVersionForm.Submit className={FOOTER_PRIMARY_BUTTON_CLASS}>
                  저장
                </updateVersionForm.Submit>
              </DialogFooter>
            </updateVersionForm.Layout>
          </updateVersionForm.AppForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
