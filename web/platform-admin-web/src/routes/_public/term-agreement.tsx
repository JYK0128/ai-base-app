import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Label, ScrollArea } from '@pkg/ui';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ShieldCheck } from 'lucide-react';
import { type MouseEventHandler, useState } from 'react';

import { getAuthControllerGetPendingTermListV1QueryOptions, useAuthControllerAgreeTermsV1 } from '@/api/generated/endpoints';
import { type PendingTermListItem, PendingTermListItemScope } from '@/api/generated/model';

export const Route = createFileRoute('/_public/term-agreement')({
  beforeLoad: ({ context }) => {
    if (!context.session.requiredAgreeTerms) {
      throw redirect({ to: '/login', replace: true });
    }
  },
  loader: async ({ context }) => {
    const res = await context.queryClient.ensureQueryData(getAuthControllerGetPendingTermListV1QueryOptions());
    return res?.items || [];
  },
  component: TermAgreement,
});

async function clearSessionAndNavigate(
  session: {
    clear: () => Promise<void>
  },
  navigate: (options: {
    to: string
    replace: boolean
  }) => Promise<unknown>,
) {
  await session.clear();
  await navigate({ to: '/login', replace: true });
}

function TermAgreement() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const items = Route.useLoaderData();
  const { mutateAsync: agreeTerms, isPending: isSubmitting } = useAuthControllerAgreeTermsV1();

  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const platformTerms = items.filter((item) => item.scope === PendingTermListItemScope.platform);
  const organizationTerms = items.filter((item) => item.scope === PendingTermListItemScope.organization);
  const platformRequiredTerms = platformTerms.filter((item) => item.required);
  const organizationRequiredTerms = organizationTerms.filter((item) => item.required);
  const requiredTerms = items.filter((item) => item.required);
  const platformRequiredVersionIds = new Set(platformRequiredTerms.map((item) => item.versionId));
  const organizationRequiredVersionIds = new Set(organizationRequiredTerms.map((item) => item.versionId));
  const isAllRequiredAgreed = requiredTerms.every((item) => selectedVersionIds.includes(item.versionId));
  const isPlatformAllRequiredAgreed = platformRequiredTerms.every((item) => selectedVersionIds.includes(item.versionId));
  const isOrganizationAllRequiredAgreed = organizationRequiredTerms.every((item) => selectedVersionIds.includes(item.versionId));

  const handleLogout: MouseEventHandler<HTMLButtonElement> = () => {
    void clearSessionAndNavigate(session, navigate);
  };

  const handleSelect = (versionId: string) => {
    setSelectedVersionIds((current) => (current.includes(versionId) ? current : [...current, versionId]));
  };

  const handleDeselect = (versionId: string) => {
    setSelectedVersionIds((current) => current.filter((id) => id !== versionId));
  };

  const handleTogglePlatformAllRequired = (checked: boolean) => {
    if (!checked) {
      setSelectedVersionIds((current) => current.filter((id) => !platformRequiredVersionIds.has(id)));
      return;
    }

    setSelectedVersionIds((current) => {
      const next = new Set(current);

      for (const item of platformRequiredTerms) {
        next.add(item.versionId);
      }

      return [...next];
    });
  };

  const handleToggleOrganizationAllRequired = (checked: boolean) => {
    if (!checked) {
      setSelectedVersionIds((current) => current.filter((id) => !organizationRequiredVersionIds.has(id)));
      return;
    }

    setSelectedVersionIds((current) => {
      const next = new Set(current);

      for (const item of organizationRequiredTerms) {
        next.add(item.versionId);
      }

      return [...next];
    });
  };

  const handleSubmit = async () => {
    const terms = items.map((item) => ({
      termsVersionId: item.versionId,
      agreed: selectedVersionIds.includes(item.versionId),
    }));

    await agreeTerms({ data: { terms } });
    await session.refresh();
    await navigate({ to: '/dashboard', replace: true });
  };

  return (
    <div className="
      grid min-h-screen place-items-center overflow-hidden bg-slate-50 p-4
    "
    >
      <Card className="
        flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden
        border-slate-200 shadow-xl
      "
      >
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="size-6" />
            <CardTitle>약관 재동의</CardTitle>
          </div>
          <CardDescription className="text-base">
            새로 추가되었거나 갱신된 약관에 동의한 뒤 서비스를 계속 이용할 수 있습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="scroll-y space-y-6">
          <AgreementSection
            title="플랫폼 약관"
            description="플랫폼 전체에 적용되는 약관입니다."
            terms={platformTerms}
            scope="platform"
            allChecked={isPlatformAllRequiredAgreed}
            onToggleAll={handleTogglePlatformAllRequired}
            activeSelectedVersionIds={selectedVersionIds}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
          />

          <AgreementSection
            title="조직 약관"
            description="현재 소속 조직에 적용되는 약관입니다."
            terms={organizationTerms}
            scope="organization"
            allChecked={isOrganizationAllRequiredAgreed}
            onToggleAll={handleToggleOrganizationAllRequired}
            activeSelectedVersionIds={selectedVersionIds}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
          />
        </CardContent>

        <CardFooter className="justify-between gap-3">
          <Button type="button" variant="ghost" onClick={handleLogout}>
            취소
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !isAllRequiredAgreed}>
            {isSubmitting ? '처리 중...' : '동의 완료'}
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
  readonly versionId: string
  readonly checked: boolean
  readonly onSelect: (versionId: string) => void
  readonly onDeselect: (versionId: string) => void
}) {
  return (
    <div className="
      flex w-full items-start gap-3 rounded-lg border border-slate-200 p-4
    "
    >
      <Checkbox
        id={versionId}
        checked={checked}
        onCheckedChange={(next) => (next ? onSelect(versionId) : onDeselect(versionId))}
        className="mt-1 shrink-0"
      />

      <div className="min-w-0 flex-1 space-y-1.5">
        <Label
          htmlFor={versionId}
          className="cursor-pointer text-sm font-semibold text-slate-800"
        >
          {title}
          <span className="ml-2 text-xs text-slate-500">{required ? '(필수)' : '(선택)'}</span>
        </Label>
        <div className="
          flex flex-wrap items-center gap-2 text-xs text-slate-500
        "
        >
          <span>
            버전
            {versionLabel}
          </span>
          {effectiveAt && <span>{new Date(effectiveAt).toLocaleString()}</span>}
        </div>
        {content && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="
                  block h-10 w-full min-w-0 overflow-hidden rounded-md text-left
                  text-sm text-slate-500 transition-colors
                  hover:bg-blue-50 hover:text-slate-700
                  focus-visible:ring-2 focus-visible:ring-blue-500
                  focus-visible:outline-none
                "
              >
                <span className="
                  line-clamp-2 block w-full min-w-0 overflow-hidden
                "
                >
                  {content}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="
              grid h-[70vh] grid-rows-[auto_1fr]
              sm:max-w-2xl
            "
            >
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="mt-4 h-full rounded-lg border p-4">
                <div className="text-sm/7 whitespace-pre-wrap text-slate-600">
                  {content}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function AgreementSection({
  title,
  description,
  terms,
  scope,
  allChecked,
  onToggleAll,
  activeSelectedVersionIds,
  onSelect,
  onDeselect,
}: {
  readonly title: string
  readonly description: string
  readonly terms: PendingTermListItem[]
  readonly scope: PendingTermListItem['scope']
  readonly allChecked: boolean
  readonly onToggleAll: (checked: boolean) => void
  readonly activeSelectedVersionIds: string[]
  readonly onSelect: (versionId: string) => void
  readonly onDeselect: (versionId: string) => void
}) {
  if (terms.length === 0) {
    if (scope === 'platform') {
      return (
        <section className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          <div className="
            rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm
            text-slate-500
          "
          >
            동의가 필요한 약관이 없습니다.
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="
          rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm
          text-slate-500
        "
        >
          현재 조직에 적용되는 약관이 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id={`${title}-all`} checked={allChecked} onCheckedChange={(checked) => onToggleAll(!!checked)} />
          <Label
            htmlFor={`${title}-all`}
            className="text-sm font-medium text-slate-700"
          >
            전체 동의
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        {terms.map((term) => (
          <AgreementTermRow
            key={term.versionId}
            title={term.title}
            required={term.required}
            versionLabel={term.version}
            content={term.content}
            effectiveAt={null}
            versionId={term.versionId}
            checked={activeSelectedVersionIds.includes(term.versionId) || term.agreed}
            onSelect={onSelect}
            onDeselect={onDeselect}
          />
        ))}
      </div>
    </section>
  );
}
