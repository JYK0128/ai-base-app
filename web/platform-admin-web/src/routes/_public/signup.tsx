import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Label, ScrollArea, toast, useAppForm } from '@pkg/ui';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Check, Lock, Mail, Phone, User } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import { useSignupControllerGetSignupTermListV1 } from '@/api/generated/endpoints';
import { type GetSignupTermListItem, GetSignupTermListItemScope } from '@/api/generated/model';

const SIGNUP_STEPS = ['약관 확인', '계정 및 프로필 정보', '완료'] as const;
type SignupStepIndex = 0 | 1 | 2;

type SignupValues = {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone: string
};

type SignupErrors = Partial<Record<'terms' | 'email' | 'password' | 'confirmPassword' | 'name' | 'phone', string>>;

export const Route = createFileRoute('/_public/signup')({
  beforeLoad: ({ context }) => {
    if (context.session.isAuthenticated) {
      throw redirect({ to: '/dashboard', replace: true });
    }
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const termsQuery = useSignupControllerGetSignupTermListV1();
  const [activeStepIndex, setActiveStepIndex] = useState<SignupStepIndex>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [values, setValues] = useState<SignupValues>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [selectedTermVersionIds, setSelectedTermVersionIds] = useState<string[]>([]);

  const platformTerms = useMemo(
    () => termsQuery.data?.items?.filter((item) => item.scope === GetSignupTermListItemScope.platform) ?? [],
    [termsQuery.data],
  );
  const platformRequiredTerms = useMemo(
    () => platformTerms.filter((item) => item.required),
    [platformTerms],
  );
  const platformTermVersionIds = useMemo(
    () => new Set(platformTerms.map((term) => term.versionId)),
    [platformTerms],
  );
  const isPlatformAllAgreed = platformTerms.length > 0 && platformTerms.every((item) => selectedTermVersionIds.includes(item.versionId));
  const isTermsReady = !termsQuery.isLoading && !termsQuery.isError && platformTerms.length > 0;
  const isTermsAgreed = platformRequiredTerms.every((item) => selectedTermVersionIds.includes(item.versionId));
  const isEmailValid = isEmail(values.email.trim());
  const isPasswordValid = isStrongPassword(values.password);
  const isPasswordMatched = values.password === values.confirmPassword;
  const isNameValid = values.name.trim().length >= 2;
  const isPhoneValid = values.phone.trim().length === 0 || isValidPhoneNumber(values.phone.trim());
  const isAccountProfileValid = isEmailValid && isPasswordValid && isPasswordMatched && isNameValid && isPhoneValid;
  const isCompleteValid = isTermsReady && isTermsAgreed && isAccountProfileValid;

  const updateValue = <K extends keyof SignupValues>(key: K, nextValue: SignupValues[K]) => {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));

    setErrors((current) => {
      const next = { ...current };

      if (key === 'email') {
        delete next.email;
      }

      if (key === 'password') {
        delete next.password;
        delete next.confirmPassword;
      }

      if (key === 'confirmPassword') {
        delete next.confirmPassword;
      }

      if (key === 'name') {
        delete next.name;
      }

      if (key === 'phone') {
        delete next.phone;
      }

      return next;
    });
  };

  const toggleTermVersion = (versionId: string, checked: boolean) => {
    setSelectedTermVersionIds((current) => {
      if (checked) {
        return current.includes(versionId) ? current : [...current, versionId];
      }

      return current.filter((item) => item !== versionId);
    });

    setErrors((current) => {
      const next = { ...current };
      delete next.terms;
      return next;
    });
  };

  const toggleAllTerms = (checked: boolean) => {
    if (!checked) {
      const nextSelectedTermVersionIds: string[] = [];

      for (const versionId of selectedTermVersionIds) {
        if (!platformTermVersionIds.has(versionId)) {
          nextSelectedTermVersionIds.push(versionId);
        }
      }

      setSelectedTermVersionIds(nextSelectedTermVersionIds);
      return;
    }

    setSelectedTermVersionIds(Array.from(platformTermVersionIds));
  };

  const validateStep0 = () => {
    if (!isTermsReady) {
      setErrors((current) => ({
        ...current,
        terms: termsQuery.isLoading ? '플랫폼 약관을 불러오는 중입니다.' : '플랫폼 약관을 불러오지 못했습니다.',
      }));
      return false;
    }

    if (isTermsAgreed) {
      setErrors((current) => {
        const next = { ...current };
        delete next.terms;
        return next;
      });
      return true;
    }

    setErrors((current) => ({
      ...current,
      terms: '필수 플랫폼 약관에 동의해주세요.',
    }));
    return false;
  };

  const validateStep1 = () => {
    const nextErrors: SignupErrors = {};

    if (values.email.trim().length === 0) {
      nextErrors.email = '이메일을 입력해주세요.';
    }
    else if (!isEmailValid) {
      nextErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (values.password.length === 0) {
      nextErrors.password = '비밀번호를 입력해주세요.';
    }
    else if (!isPasswordValid) {
      nextErrors.password = '비밀번호는 8자 이상이며 영문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다.';
    }

    if (values.confirmPassword.length === 0) {
      nextErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    }
    else if (!isPasswordMatched) {
      nextErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (values.name.trim().length === 0) {
      nextErrors.name = '이름을 입력해주세요.';
    }
    else if (!isNameValid) {
      nextErrors.name = '이름은 공백 제외 2자 이상이어야 합니다.';
    }

    if (values.phone.trim().length > 0 && !isPhoneValid) {
      nextErrors.phone = '휴대폰 번호는 010-1234-5678 형식으로 입력해주세요.';
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStepIndex === 0 && !validateStep0()) {
      return;
    }

    if (activeStepIndex === 1 && !validateStep1()) {
      return;
    }

    setActiveStepIndex((current) => Math.min(current + 1, 2) as SignupStepIndex);
  };

  const handleBack = () => {
    setActiveStepIndex((current) => Math.max(current - 1, 0) as SignupStepIndex);
  };

  const handleSubmit = async () => {
    const isStep0Valid = validateStep0();
    const isStep1Valid = validateStep1();

    if (!isStep0Valid || !isStep1Valid) {
      setActiveStepIndex(isStep0Valid ? 1 : 0);
      return;
    }

    setIsSubmitted(true);
    setActiveStepIndex(2);
    toast.success('회원가입 신청이 완료되었습니다.');
  };

  return (
    <div className="
      grid min-h-screen place-items-center overflow-hidden bg-slate-50 p-4
    "
    >
      <Card className="
        grid h-168 max-h-[calc(100vh-2rem)] w-full max-w-2xl
        grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border-slate-200
        shadow-xl
      "
      >
        <CardHeader className="
          grid gap-3 px-5 pt-5
          sm:px-6 sm:pt-6
        "
        >
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                void navigate({ to: '/login' });
              }}
            >
              <ArrowLeft />
              로그인으로 이동
            </Button>
          </div>

          <div className="space-y-1.5">
            <CardTitle className="
              text-lg
              sm:text-xl
            "
            >
              계정 생성을 시작하고 관리자 접근 준비를 진행합니다.
            </CardTitle>
            <CardDescription className="text-sm">
              플랫폼 약관을 먼저 확인한 뒤, 계정 및 프로필 정보를 입력하고 가입 신청을 마무리합니다.
            </CardDescription>
          </div>

          <SignupStepTrail activeStepIndex={isSubmitted ? 2 : activeStepIndex} />
        </CardHeader>

        <SignupCardBody
          isSubmitted={isSubmitted}
          activeStepIndex={activeStepIndex}
          termsQuery={termsQuery}
          platformTerms={platformTerms}
          selectedTermVersionIds={selectedTermVersionIds}
          isPlatformAllAgreed={isPlatformAllAgreed}
          errors={errors}
          values={values}
          isTermsAgreed={isTermsAgreed}
          isAccountProfileValid={isAccountProfileValid}
          toggleAllTerms={toggleAllTerms}
          toggleTermVersion={toggleTermVersion}
          updateValue={updateValue}
        />

        <CardFooter className="
          flex-col justify-between gap-2
          sm:flex-row
        "
        >
          {isSubmitted
            ? (
              <>
                <CardDescription>
                  가입 신청이 처리되면 인증 메일 안내를 받을 수 있습니다.
                </CardDescription>
                <Button
                  type="button"
                  onClick={() => {
                    void navigate({ to: '/login', replace: true });
                  }}
                >
                  로그인으로 이동
                </Button>
              </>
            )
            : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={activeStepIndex === 0 ? () => void navigate({ to: '/login' }) : handleBack}
                >
                  {activeStepIndex === 0 ? '취소' : '이전'}
                </Button>

                {activeStepIndex < 2
                  ? (
                    <Button type="button" onClick={handleNext}>
                      다음
                      <ArrowRight />
                    </Button>
                  )
                  : (
                    <Button type="button" disabled={!isCompleteValid} onClick={() => void handleSubmit()}>
                      가입 신청 완료
                      <Check />
                    </Button>
                  )}
              </>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}

function SignupCardBody({
  isSubmitted,
  activeStepIndex,
  termsQuery,
  platformTerms,
  selectedTermVersionIds,
  isPlatformAllAgreed,
  errors,
  values,
  isTermsAgreed,
  isAccountProfileValid,
  toggleAllTerms,
  toggleTermVersion,
  updateValue,
}: {
  readonly isSubmitted: boolean
  readonly activeStepIndex: SignupStepIndex
  readonly termsQuery: {
    readonly isLoading: boolean
    readonly isError: boolean
  }
  readonly platformTerms: GetSignupTermListItem[]
  readonly selectedTermVersionIds: string[]
  readonly isPlatformAllAgreed: boolean
  readonly errors: SignupErrors
  readonly values: SignupValues
  readonly isTermsAgreed: boolean
  readonly isAccountProfileValid: boolean
  readonly toggleAllTerms: (checked: boolean) => void
  readonly toggleTermVersion: (versionId: string, checked: boolean) => void
  readonly updateValue: <K extends keyof SignupValues>(key: K, nextValue: SignupValues[K]) => void
}) {
  return (
    <CardContent className="min-h-0 overflow-hidden px-0">
      <ScrollArea className="h-full">
        <div className="
          grid content-start gap-5 px-5 pb-5
          sm:px-6 sm:pb-6
        "
        >
          {isSubmitted
            ? (
              <SignupCompletePanel email={values.email} />
            )
            : (
              <>
                {activeStepIndex === 0 && (
                  <TermsStep
                    terms={platformTerms}
                    selectedVersionIds={selectedTermVersionIds}
                    allChecked={isPlatformAllAgreed}
                    error={errors.terms}
                    isLoading={termsQuery.isLoading}
                    isError={termsQuery.isError}
                    onToggleAllTerms={toggleAllTerms}
                    onToggleTermVersion={toggleTermVersion}
                  />
                )}

                {activeStepIndex === 1 && (
                  <AccountProfileStep
                    email={values.email}
                    password={values.password}
                    confirmPassword={values.confirmPassword}
                    name={values.name}
                    phone={values.phone}
                    emailError={errors.email}
                    passwordError={errors.password}
                    confirmPasswordError={errors.confirmPassword}
                    nameError={errors.name}
                    phoneError={errors.phone}
                    onChangeEmail={(value) => updateValue('email', value)}
                    onChangePassword={(value) => updateValue('password', value)}
                    onChangeConfirmPassword={(value) => updateValue('confirmPassword', value)}
                    onChangeName={(value) => updateValue('name', value)}
                    onChangePhone={(value) => updateValue('phone', value)}
                  />
                )}

                {activeStepIndex === 2 && (
                  <SignupCompleteReview
                    email={values.email}
                    name={values.name}
                    phone={values.phone}
                    termsAgreed={isTermsAgreed}
                    accountProfileValid={isAccountProfileValid}
                    termsCount={platformTerms.length}
                    selectedTermCount={selectedTermVersionIds.length}
                  />
                )}
              </>
            )}
        </div>
      </ScrollArea>
    </CardContent>
  );
}

function SignupStepTrail({ activeStepIndex }: { readonly activeStepIndex: SignupStepIndex }) {
  return (
    <div className="grid gap-2.5">
      <div className="
        flex items-center justify-between gap-2 text-center text-[11px]
        font-medium text-slate-500
      "
      >
        {SIGNUP_STEPS.map((label, index) => (
          <div
            key={label}
            className={`
              ${stepLabelClassName(index as SignupStepIndex, activeStepIndex)}
              flex-1
            `}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {SIGNUP_STEPS.map((_, index) => (
          <div
            key={index}
            className={index <= activeStepIndex
              ? 'h-1 rounded-full bg-primary'
              : 'h-1 rounded-full bg-slate-200'}
          />
        ))}
      </div>
    </div>
  );
}

function TermsStep({
  terms,
  selectedVersionIds,
  allChecked,
  error,
  isLoading,
  isError,
  onToggleAllTerms,
  onToggleTermVersion,
}: {
  readonly terms: GetSignupTermListItem[]
  readonly selectedVersionIds: string[]
  readonly allChecked: boolean
  readonly error?: string
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onToggleAllTerms: (checked: boolean) => void
  readonly onToggleTermVersion: (versionId: string, checked: boolean) => void
}) {
  let termsContent: ReactNode;

  if (isLoading) {
    termsContent = (
      <div className="
        rounded-lg border border-slate-200 px-4 py-6 text-sm text-slate-500
      "
      >
        플랫폼 약관을 불러오는 중입니다.
      </div>
    );
  }
  else if (isError || terms.length === 0) {
    termsContent = (
      <div className="
        rounded-lg border border-slate-200 px-4 py-6 text-sm text-slate-500
      "
      >
        플랫폼 약관을 확인할 수 없습니다.
      </div>
    );
  }
  else {
    termsContent = (
      <div className="space-y-4">
        {terms.map((term) => (
          <TermsRow
            key={term.versionId}
            term={term}
            checked={selectedVersionIds.includes(term.versionId)}
            onCheckedChange={(checked) => onToggleTermVersion(term.versionId, checked)}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">약관 확인</h3>
          <p className="text-xs text-slate-500">플랫폼 약관을 확인하고 필수 항목에 동의해주세요.</p>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="signup-terms-all"
            checked={allChecked}
            onCheckedChange={(checked) => onToggleAllTerms(checked === true)}
            className="shrink-0"
          />
          <Label
            htmlFor="signup-terms-all"
            className="cursor-pointer text-sm font-medium text-slate-700"
          >
            전체 동의
          </Label>
        </div>
      </div>

      {termsContent}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}

function AccountProfileStep({
  email,
  password,
  confirmPassword,
  name,
  phone,
  emailError,
  passwordError,
  confirmPasswordError,
  nameError,
  phoneError,
  onChangeEmail,
  onChangePassword,
  onChangeConfirmPassword,
  onChangeName,
  onChangePhone,
}: {
  readonly email: string
  readonly password: string
  readonly confirmPassword: string
  readonly name: string
  readonly phone: string
  readonly emailError?: string
  readonly passwordError?: string
  readonly confirmPasswordError?: string
  readonly nameError?: string
  readonly phoneError?: string
  readonly onChangeEmail: (value: string) => void
  readonly onChangePassword: (value: string) => void
  readonly onChangeConfirmPassword: (value: string) => void
  readonly onChangeName: (value: string) => void
  readonly onChangePhone: (value: string) => void
}) {
  const form = useAppForm({
    defaultValues: {
      email,
      password,
      confirmPassword,
      name,
      phone,
    },
  });

  return (
    <section className="grid h-full min-h-0 gap-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">계정 및 프로필 정보</h3>
        <p className="text-sm text-slate-500">로그인 정보와 관리자 프로필을 한 번에 입력합니다.</p>
      </div>

      <form.AppForm>
        <div className="grid gap-4">
          <div className="
            grid gap-3 rounded-xl border border-slate-200 bg-white p-3.5
          "
          >
            <div className="
              flex items-center gap-2 text-sm font-semibold text-slate-900
            "
            >
              <Lock className="size-4" />
              계정 정보
            </div>
            <form.AppField name="email">
              {(field) => (
                <field.Input
                  label="이메일"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  leftSide={<Mail />}
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  onChange={(event) => onChangeEmail(event.target.value)}
                />
              )}
            </form.AppField>
            {emailError && <p className="text-xs text-red-600">{emailError}</p>}

            <form.AppField name="password">
              {(field) => (
                <field.Input
                  label="비밀번호"
                  type="password"
                  autoComplete="new-password"
                  placeholder="8자 이상 입력"
                  leftSide={<Lock />}
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  onChange={(event) => onChangePassword(event.target.value)}
                />
              )}
            </form.AppField>
            {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}

            <form.AppField name="confirmPassword">
              {(field) => (
                <field.Input
                  label="비밀번호 확인"
                  type="password"
                  autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력"
                  leftSide={<Lock />}
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  onChange={(event) => onChangeConfirmPassword(event.target.value)}
                />
              )}
            </form.AppField>
            {confirmPasswordError && <p className="text-xs text-red-600">{confirmPasswordError}</p>}
          </div>

          <div className="
            grid gap-3 rounded-xl border border-slate-200 bg-white p-3.5
          "
          >
            <div className="
              flex items-center gap-2 text-sm font-semibold text-slate-900
            "
            >
              <User className="size-4" />
              프로필 정보
            </div>
            <form.AppField name="name">
              {(field) => (
                <field.Input
                  label="이름"
                  autoComplete="name"
                  placeholder="김개발"
                  leftSide={<User />}
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  onChange={(event) => onChangeName(event.target.value)}
                />
              )}
            </form.AppField>
            {nameError && <p className="text-xs text-red-600">{nameError}</p>}

            <form.AppField name="phone">
              {(field) => (
                <field.Input
                  label="휴대폰 번호"
                  type="tel"
                  autoComplete="tel"
                  placeholder="010-1234-5678"
                  leftSide={<Phone />}
                  orientation="vertical"
                  labelWidth="auto"
                  onChange={(event) => onChangePhone(event.target.value)}
                />
              )}
            </form.AppField>
            {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
          </div>
        </div>
      </form.AppForm>
    </section>
  );
}

function SignupCompleteReview({
  email,
  name,
  phone,
  termsAgreed,
  accountProfileValid,
  termsCount,
  selectedTermCount,
}: {
  readonly email: string
  readonly name: string
  readonly phone: string
  readonly termsAgreed: boolean
  readonly accountProfileValid: boolean
  readonly termsCount: number
  readonly selectedTermCount: number
}) {
  return (
    <section className="grid h-full min-h-0 gap-5">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">완료 확인</h3>
        <p className="text-sm text-slate-500">입력한 정보를 확인한 뒤 가입 신청을 마무리합니다.</p>
      </div>

      <div className="
        grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5
      "
      >
        <SummaryRow label="이메일" value={email} />
        <SummaryRow label="이름" value={name} />
        <SummaryRow label="휴대폰 번호" value={phone || '입력 안 함'} />
        <SummaryRow label="플랫폼 약관" value={`${termsAgreed ? '완료' : '미완료'} (${selectedTermCount}/${termsCount})`} />
        <SummaryRow label="정보 검증" value={accountProfileValid ? '완료' : '미완료'} />
      </div>
    </section>
  );
}

function SignupCompletePanel({ email }: { readonly email: string }) {
  return (
    <section className="
      grid h-full min-h-0 place-items-center rounded-2xl border border-slate-200
      bg-slate-50 p-5 text-center
    "
    >
      <div className="max-w-sm space-y-3">
        <div className="
          mx-auto flex size-12 items-center justify-center rounded-full
          bg-primary text-primary-foreground
        "
        >
          <Check className="size-5" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">가입 신청이 완료되었습니다.</h3>
        <p className="text-sm text-slate-600">
          {email}
          로 인증 메일을 전송하는 단계로 이어질 수 있습니다.
        </p>
      </div>
    </section>
  );
}

function TermsRow({
  term,
  checked,
  onCheckedChange,
}: {
  readonly term: GetSignupTermListItem
  readonly checked: boolean
  readonly onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="
      flex w-full items-start gap-3 rounded-lg border border-slate-200 p-4
    "
    >
      <Checkbox
        id={term.versionId}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next === true)}
        className="mt-1 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="space-y-1">
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
            <span>{`버전 ${term.version}`}</span>
          </div>
        </div>
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
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { readonly label: string, readonly value: string }) {
  return (
    <div className="
      flex items-start justify-between gap-4 rounded-lg bg-white px-4 py-3
    "
    >
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold break-all text-slate-900">{value}</span>
    </div>
  );
}

function stepLabelClassName(index: SignupStepIndex, activeStepIndex: SignupStepIndex) {
  if (index === activeStepIndex) {
    return 'text-primary';
  }

  if (index < activeStepIndex) {
    return 'text-slate-900';
  }

  return 'text-slate-400';
}

function isEmail(value: string) {
  const atIndex = value.indexOf('@');

  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) {
    return false;
  }

  const localPart = value.slice(0, atIndex);
  const domainPart = value.slice(atIndex + 1);

  if (localPart.length === 0 || domainPart.length < 3) {
    return false;
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return false;
  }

  const dotIndex = domainPart.lastIndexOf('.');

  return dotIndex > 0 && dotIndex < domainPart.length - 1;
}

function isStrongPassword(value: string) {
  return value.length >= 8
    && /[A-Za-z]/.test(value)
    && /\d/.test(value)
    && /[!@#$%^&*]/.test(value);
}

function isValidPhoneNumber(value: string) {
  const parts = value.split('-');

  if (parts.length !== 3) {
    return false;
  }

  const [first, second, third] = parts;

  return isDigits(first)
    && isDigits(second)
    && isDigits(third)
    && first.length >= 2
    && first.length <= 3
    && second.length >= 3
    && second.length <= 4
    && third.length === 4;
}

function isDigits(value: string) {
  return value.length > 0 && Array.from(value).every((char) => char >= '0' && char <= '9');
}
