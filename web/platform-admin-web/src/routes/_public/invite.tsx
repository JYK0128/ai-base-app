import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Label, ScrollArea } from '@pkg/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Check, MailCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { useJoinControllerAcceptV1, useJoinControllerVerifyV1 } from '@/api/generated/endpoints';
import { type VerifyJoinTermItem, VerifyJoinTermItemScope } from '@/api/generated/model';

const JOIN_STEPS = ['동의', '개인정보', '완료'] as const;
type JoinStepIndex = 0 | 1 | 2;

export const Route = createFileRoute('/_public/invite')({
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  component: InviteAccept,
});

function InviteAccept() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const verifyQuery = useJoinControllerVerifyV1(
    { token: token ?? '' },
    { query: { enabled: Boolean(token) } },
  );
  const { mutateAsync: acceptJoin, isPending: isSubmitting } = useJoinControllerAcceptV1();
  const invite = verifyQuery.data;
  const platformTerms = invite?.terms.filter((term) => term.scope === VerifyJoinTermItemScope.platform) ?? [];
  const organizationTerms = invite?.terms.filter((term) => term.scope === VerifyJoinTermItemScope.organization) ?? [];
  const requiredTerms = invite?.terms.filter((term) => term.required) ?? [];
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedTermIds, setSelectedTermIds] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<JoinStepIndex>(0);

  const displayName = name || invite?.name || '';
  const isRequiredTermsAgreed = requiredTerms.every((term) => selectedTermIds.includes(term.versionId));
  const canSubmit = Boolean(token && invite && displayName && password && password === confirmPassword && isRequiredTermsAgreed);
  const isAllRequiredTermsAgreed = requiredTerms.every((term) => selectedTermIds.includes(term.versionId));

  const handleToggleTerm = (versionId: string, checked: boolean) => {
    setSelectedTermIds((current) => {
      if (checked) {
        return current.includes(versionId) ? current : [...current, versionId];
      }
      return current.filter((id) => id !== versionId);
    });
  };

  const handleSelectTerm = (versionId: string) => {
    handleToggleTerm(versionId, true);
  };

  const handleDeselectTerm = (versionId: string) => {
    handleToggleTerm(versionId, false);
  };

  const handleToggleAllRequiredTerms = (checked: boolean, terms: VerifyJoinTermItem[]) => {
    const requiredTermIds = new Set(terms.map((term) => term.versionId));

    if (!checked) {
      setSelectedTermIds((current) => current.filter((id) => !requiredTermIds.has(id)));
      return;
    }

    setSelectedTermIds((current) => {
      const next = new Set(current);

      for (const term of terms) {
        next.add(term.versionId);
      }

      return [...next];
    });
  };

  const handleSubmit = async () => {
    if (!token || !invite || !canSubmit) {
      return;
    }

    await acceptJoin({
      data: {
        token,
        profile: {
          name: displayName,
          email: invite.email,
          password,
        },
        terms: invite.terms.map((term) => ({
          termsVersionId: term.versionId,
          agreed: selectedTermIds.includes(term.versionId),
        })),
      },
    });
    setActiveStepIndex(2);
  };

  if (!token) {
    return (
      <InviteAcceptShell
        title="초대 링크가 올바르지 않습니다."
        description="초대 토큰이 없습니다. 메일의 초대 링크를 다시 확인해주세요."
      />
    );
  }

  if (verifyQuery.isLoading) {
    return (
      <InviteAcceptShell
        title="초대 정보를 확인하고 있습니다."
        description="잠시만 기다려주세요."
      />
    );
  }

  if (verifyQuery.isError || !invite) {
    return (
      <InviteAcceptShell
        title="초대 링크를 사용할 수 없습니다."
        description="초대가 만료되었거나 취소되었습니다. 관리자에게 새 초대를 요청해주세요."
      />
    );
  }

  return (
    <div className="
      grid min-h-screen place-items-center overflow-hidden bg-slate-50 p-4
    "
    >
      <Card className="
        flex h-168 max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col
        overflow-hidden border-slate-200 shadow-xl
      "
      >
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-900">
            <MailCheck className="size-6" />
            <CardTitle>초대 가입</CardTitle>
          </div>
          <CardDescription>
            {`${invite.organizationName} 조직에 ${invite.roleName} 역할로 초대되었습니다.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="scroll-y flex-1 space-y-6">
          <div className="sticky top-0 z-20 bg-card pb-2">
            <JoinStepTrail activeStepIndex={activeStepIndex} />
          </div>

          {activeStepIndex === 0 && (
            <InviteAgreementSection
              platformTerms={platformTerms}
              organizationTerms={organizationTerms}
              activeSelectedVersionIds={selectedTermIds}
              onToggleRequiredTerms={handleToggleAllRequiredTerms}
              onSelect={handleSelectTerm}
              onDeselect={handleDeselectTerm}
            />
          )}

          {activeStepIndex === 1 && (
            <InviteProfileSection
              email={invite.email}
              displayName={displayName}
              password={password}
              confirmPassword={confirmPassword}
              onChangeName={setName}
              onChangePassword={setPassword}
              onChangeConfirmPassword={setConfirmPassword}
            />
          )}

          {activeStepIndex === 2 && <InviteCompleteSection />}
        </CardContent>

        <CardFooter className="justify-between gap-3">
          {activeStepIndex === 0 && (
            <>
              <Button type="button" variant="ghost" onClick={() => void navigate({ to: '/login', replace: true })}>
                로그인으로 이동
              </Button>
              <Button onClick={() => setActiveStepIndex(1)} disabled={!isAllRequiredTermsAgreed}>
                다음
              </Button>
            </>
          )}

          {activeStepIndex === 1 && (
            <>
              <Button type="button" variant="ghost" onClick={() => setActiveStepIndex(0)}>
                이전
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? '가입 처리 중...' : '가입 완료'}
              </Button>
            </>
          )}

          {activeStepIndex === 2 && (
            <>
              <div />
              <Button onClick={() => void navigate({ to: '/login', replace: true })}>
                로그인으로 이동
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function InviteInput({
  id,
  label,
  value,
  type = 'text',
  readOnly = false,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly type?: string
  readonly readOnly?: boolean
  readonly onChange?: (value: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        value={value}
        readOnly={readOnly}
        type={type}
        autoComplete={type === 'password' ? 'new-password' : undefined}
        onChange={(event) => onChange?.(event.target.value)}
        className="
          h-10 rounded-md border border-slate-200 bg-white px-3 text-sm
          text-slate-900 outline-none
          read-only:bg-slate-100 read-only:text-slate-600
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100
        "
      />
    </div>
  );
}

function InviteAcceptShell({
  title,
  description,
}: {
  readonly title: string
  readonly description: string
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="size-6" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function JoinStepTrail({
  activeStepIndex,
}: {
  readonly activeStepIndex: number
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <ol className="grid grid-cols-3">
        {JOIN_STEPS.map((step, index) => {
          const isCompleted = index < activeStepIndex;
          const isActive = index === activeStepIndex;
          const isPassed = index <= activeStepIndex;

          return (
            <li key={step} className="relative flex justify-center">
              {index > 0 && (
                <span className={`
                  absolute top-3 left-0 h-px w-1/2
                  ${isPassed ? 'bg-blue-500' : 'bg-slate-300'}
                `}
                />
              )}
              {index < JOIN_STEPS.length - 1 && (
                <span className={`
                  absolute top-3 right-0 h-px w-1/2
                  ${index < activeStepIndex ? 'bg-blue-500' : 'bg-slate-300'}
                `}
                />
              )}
              <span
                aria-current={isActive ? 'step' : undefined}
                className={getStepCircleClassName(isCompleted, isActive)}
              >
                {isCompleted ? <Check className="size-3.5" /> : index + 1}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-2 grid grid-cols-3 text-center">
        {JOIN_STEPS.map((step, index) => (
          <span
            key={step}
            className={getStepLabelClassName(index, activeStepIndex)}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

function getStepCircleClassName(isCompleted: boolean, isActive: boolean) {
  if (isCompleted || isActive) {
    return `
      relative z-10 flex size-6 items-center justify-center rounded-full
      bg-blue-600 text-xs font-semibold text-white
    `;
  }

  return `
    relative z-10 flex size-6 items-center justify-center rounded-full
    bg-white text-xs font-semibold text-slate-500 ring-1 ring-slate-300
  `;
}

function getStepLabelClassName(index: number, activeStepIndex: number) {
  if (index === activeStepIndex) {
    return 'text-xs font-semibold text-blue-700';
  }

  if (index < activeStepIndex) {
    return 'text-xs font-semibold text-slate-900';
  }

  return 'text-xs font-semibold text-slate-500';
}

function InviteProfileSection({
  email,
  displayName,
  password,
  confirmPassword,
  onChangeName,
  onChangePassword,
  onChangeConfirmPassword,
}: {
  readonly email: string
  readonly displayName: string
  readonly password: string
  readonly confirmPassword: string
  readonly onChangeName: (value: string) => void
  readonly onChangePassword: (value: string) => void
  readonly onChangeConfirmPassword: (value: string) => void
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">개인정보</h3>
        <p className="text-xs text-slate-500">가입에 필요한 정보를 입력해주세요.</p>
      </div>
      <div className="grid gap-4">
        <InviteInput id="invite-email" label="이메일" value={email} readOnly />
        <InviteInput id="invite-name" label="이름" value={displayName} onChange={onChangeName} />
        <InviteInput id="invite-password" label="비밀번호" value={password} type="password" onChange={onChangePassword} />
        <InviteInput
          id="invite-confirm-password"
          label="비밀번호 확인"
          value={confirmPassword}
          type="password"
          onChange={onChangeConfirmPassword}
        />
        {confirmPassword && password !== confirmPassword
          ? (
            <p className="text-xs text-red-600">비밀번호가 일치하지 않습니다.</p>
          )
          : null}
      </div>
    </section>
  );
}

function InviteCompleteSection() {
  return (
    <section className="
      grid min-h-44 place-items-center rounded-lg border border-slate-200
      bg-slate-50 p-6 text-center
    "
    >
      <div className="space-y-2">
        <div className="
          mx-auto flex size-10 items-center justify-center rounded-full
          bg-blue-600 text-white
        "
        >
          <Check className="size-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">가입이 완료되었습니다.</h3>
        <p className="text-xs text-slate-500">로그인 화면으로 이동해 서비스를 이용할 수 있습니다.</p>
      </div>
    </section>
  );
}

function InviteAgreementSection({
  platformTerms,
  organizationTerms,
  activeSelectedVersionIds,
  onToggleRequiredTerms,
  onSelect,
  onDeselect,
}: {
  readonly platformTerms: VerifyJoinTermItem[]
  readonly organizationTerms: VerifyJoinTermItem[]
  readonly activeSelectedVersionIds: string[]
  readonly onToggleRequiredTerms: (checked: boolean, terms: VerifyJoinTermItem[]) => void
  readonly onSelect: (versionId: string) => void
  readonly onDeselect: (versionId: string) => void
}) {
  return (
    <>
      <InviteAgreementGroupSection
        title="플랫폼 약관"
        description="플랫폼 전체에 적용되는 약관입니다."
        emptyMessage="동의가 필요한 약관이 없습니다."
        terms={platformTerms}
        activeSelectedVersionIds={activeSelectedVersionIds}
        onToggleRequiredTerms={onToggleRequiredTerms}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />

      <InviteAgreementGroupSection
        title="조직 약관"
        description="초대받은 조직에 적용되는 약관입니다."
        emptyMessage="현재 조직에 적용되는 약관이 없습니다."
        terms={organizationTerms}
        activeSelectedVersionIds={activeSelectedVersionIds}
        onToggleRequiredTerms={onToggleRequiredTerms}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />
    </>
  );
}

function InviteAgreementGroupSection({
  title,
  description,
  emptyMessage,
  terms,
  activeSelectedVersionIds,
  onToggleRequiredTerms,
  onSelect,
  onDeselect,
}: {
  readonly title: string
  readonly description: string
  readonly emptyMessage: string
  readonly terms: VerifyJoinTermItem[]
  readonly activeSelectedVersionIds: string[]
  readonly onToggleRequiredTerms: (checked: boolean, terms: VerifyJoinTermItem[]) => void
  readonly onSelect: (versionId: string) => void
  readonly onDeselect: (versionId: string) => void
}) {
  const requiredTerms = terms.filter((term) => term.required);
  const isAllRequiredAgreed = requiredTerms.every((term) => activeSelectedVersionIds.includes(term.versionId));

  if (terms.length === 0) {
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
          {emptyMessage}
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
          <Checkbox
            id={`${title}-all`}
            checked={isAllRequiredAgreed}
            onCheckedChange={(checked) => onToggleRequiredTerms(!!checked, requiredTerms)}
          />
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
          <InviteTermRow
            key={term.versionId}
            term={term}
            checked={activeSelectedVersionIds.includes(term.versionId)}
            onSelect={onSelect}
            onDeselect={onDeselect}
          />
        ))}
      </div>
    </section>
  );
}

function InviteTermRow({
  term,
  checked,
  onSelect,
  onDeselect,
}: {
  readonly term: VerifyJoinTermItem
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
        id={term.versionId}
        checked={checked}
        onCheckedChange={(next) => (next ? onSelect(term.versionId) : onDeselect(term.versionId))}
        className="mt-1 shrink-0"
      />

      <div className="min-w-0 flex-1 space-y-1.5">
        <Label
          htmlFor={term.versionId}
          className="cursor-pointer text-sm font-semibold text-slate-800"
        >
          {term.title}
          <span className="ml-2 text-xs text-slate-500">{term.required ? '(필수)' : '(선택)'}</span>
        </Label>
        <div className="
          flex flex-wrap items-center gap-2 text-xs text-slate-500
        "
        >
          <span>
            버전
            {term.version}
          </span>
        </div>
        {term.content && (
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
                  {term.content}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="
              grid h-[70vh] grid-rows-[auto_1fr]
              sm:max-w-2xl
            "
            >
              <DialogHeader>
                <DialogTitle>{term.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="mt-4 h-full rounded-lg border p-4">
                <div className="text-sm/7 whitespace-pre-wrap text-slate-600">
                  {term.content}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
