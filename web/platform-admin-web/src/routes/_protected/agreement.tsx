import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Label, ScrollArea, Separator, toast } from '@pkg/ui';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getAuthControllerMeV1QueryKey, getTermsControllerGetTermsDocumentV1QueryOptions, useTermsControllerAgreeTermsV1, useTermsControllerGetActiveTermsV1 } from '../../api/endpoints';
import type { TermsDocumentDetailResponseDto, TermsDocumentResponseDto } from '../../api/model';
import { useAuth } from '../../hooks/useAuth';

export const Route = createFileRoute('/_protected/agreement')({
  component: AgreementPage,
});

type AgreementItem = {
  document: TermsDocumentResponseDto
  detail?: TermsDocumentDetailResponseDto
  currentVersionId: string | null
};

function AgreementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { memberId, agreedTermsVersionIds, setMustAcceptTermsOverride } = useAuth();
  const { mutateAsync: agreeTerms, isPending } = useTermsControllerAgreeTermsV1();
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[] | null>(null);

  const { data: activeTermsResponse, isLoading: isActiveTermsLoading } = useTermsControllerGetActiveTermsV1({
    query: {
      staleTime: 0,
    },
  });

  const documents = activeTermsResponse?.data ?? [];

  const detailQueries = useQueries({
    queries: documents.map((document) => getTermsControllerGetTermsDocumentV1QueryOptions(document.id, {
      query: {
        enabled: !!document.id,
      },
    })),
  });

  const terms = useMemo<AgreementItem[]>(() => {
    return documents.map((document, index) => {
      const detail = detailQueries[index]?.data?.data;
      return {
        document,
        detail,
        currentVersionId: detail?.currentVersion?.id ?? null,
      };
    });
  }, [detailQueries, documents]);

  const initialSelectedVersionIds = useMemo(() => {
    return terms
      .filter((term) => term.currentVersionId && agreedTermsVersionIds.includes(term.currentVersionId))
      .map((term) => term.currentVersionId as string);
  }, [agreedTermsVersionIds, terms]);

  useEffect(() => {
    if (selectedVersionIds !== null) return;
    if (terms.length === 0) return;

    setSelectedVersionIds(initialSelectedVersionIds);
  }, [initialSelectedVersionIds, selectedVersionIds, terms.length]);

  const resolvedSelectedVersionIds = selectedVersionIds ?? initialSelectedVersionIds;
  const requiredTerms = terms.filter((term) => term.document.required);
  const isAllRequiredAgreed = requiredTerms.every((term) => term.currentVersionId && resolvedSelectedVersionIds.includes(term.currentVersionId));
  const isLoading = isActiveTermsLoading || detailQueries.some((query) => query.isLoading);

  const handleSelect = (versionId: string) => {
    setSelectedVersionIds((prev) => {
      const current = prev ?? resolvedSelectedVersionIds;
      return current.includes(versionId) ? current : [...current, versionId];
    });
  };

  const handleDeselect = (versionId: string) => {
    setSelectedVersionIds((prev) => {
      const current = prev ?? resolvedSelectedVersionIds;
      return current.filter((value) => value !== versionId);
    });
  };

  const handleToggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedVersionIds([]);
      return;
    }

    setSelectedVersionIds(
      terms
        .map((term) => term.currentVersionId)
        .filter((id): id is string => !!id),
    );
  };

  const handleSubmit = async () => {
    if (!memberId) {
      toast.error('멤버 정보를 확인할 수 없습니다.');
      return;
    }

    if (!isAllRequiredAgreed) {
      toast.error('필수 약관에 모두 동의해 주세요.');
      return;
    }

    const targetVersionIds = resolvedSelectedVersionIds.filter((versionId, index, values) => values.indexOf(versionId) === index);

    try {
      for (const termsVersionId of targetVersionIds) {
        await agreeTerms({ data: { memberId, termsVersionId } });
      }

      setMustAcceptTermsOverride(false);
      await queryClient.invalidateQueries({ queryKey: getAuthControllerMeV1QueryKey() });
      await queryClient.refetchQueries({ queryKey: getAuthControllerMeV1QueryKey(), type: 'active' });
      toast.success('약관 동의가 완료되었습니다.');
      await navigate({ to: '/dashboard', replace: true });
    }
    catch (error) {
      console.error('Failed to agree terms:', error);
      toast.error('약관 동의 중 오류가 발생했습니다.');
    }
  };

  if (isLoading && terms.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          약관 정보를 불러오는 중입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <Card className="w-full max-w-2xl border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-6 w-6" />
            <CardTitle>약관 재동의</CardTitle>
          </div>
          <CardDescription className="text-base">
            새로 추가되었거나 갱신된 약관에 동의한 뒤 서비스를 계속 이용할 수 있습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="all-terms"
                checked={terms.length > 0 && resolvedSelectedVersionIds.length === terms.filter((term) => term.currentVersionId).length}
                onCheckedChange={(checked) => handleToggleAll(!!checked)}
              />
              <Label htmlFor="all-terms" className="font-semibold text-slate-700">
                전체 동의
              </Label>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              {terms.map((term) => (
                <AgreementTermRow
                  key={term.document.id}
                  title={term.document.title}
                  required={term.document.required}
                  versionLabel={term.detail?.currentVersion?.versionLabel ?? '-'}
                  content={term.detail?.currentVersion?.content ?? ''}
                  effectiveAt={term.detail?.currentVersion?.effectiveAt ?? null}
                  versionId={term.currentVersionId}
                  checked={term.currentVersionId ? resolvedSelectedVersionIds.includes(term.currentVersionId) : false}
                  onSelect={handleSelect}
                  onDeselect={handleDeselect}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            필수 약관 동의 후 대시보드로 이동합니다.
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-3">
          <Button onClick={() => void handleSubmit()} disabled={isPending || !isAllRequiredAgreed}>
            {isPending ? '처리 중...' : '동의 완료'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function AgreementTermRow({
  title,
  required,
  versionLabel,
  content,
  effectiveAt,
  versionId,
  checked,
  onSelect,
  onDeselect,
}: {
  readonly title: string
  readonly required: boolean
  readonly versionLabel: string
  readonly content: string
  readonly effectiveAt: string | null | undefined
  readonly versionId: string | null
  readonly checked: boolean
  readonly onSelect: (versionId: string) => void
  readonly onDeselect: (versionId: string) => void
}) {
  if (!versionId) return null;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id={versionId}
          checked={checked}
          onCheckedChange={(next) => (next ? onSelect(versionId) : onDeselect(versionId))}
          className="mt-1"
        />
        <div className="space-y-1.5">
          <Label htmlFor={versionId} className="cursor-pointer text-sm font-semibold text-slate-800">
            {title}
            <span className="ml-2 text-xs text-slate-500">
              {required ? '(필수)' : '(선택)'}
            </span>
          </Label>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>
              버전
              {versionLabel}
            </span>
            {effectiveAt && <span>{new Date(effectiveAt).toLocaleString()}</span>}
          </div>
          {content && (
            <p className="line-clamp-2 max-w-xl text-sm text-slate-500">
              {content}
            </p>
          )}
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" size="sm">
            보기
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 max-h-[420px] rounded-lg border p-4">
            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
