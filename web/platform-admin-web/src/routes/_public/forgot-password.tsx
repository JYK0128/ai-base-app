import { Card,
         CardContent,
         CardDescription,
         CardFooter,
         CardHeader,
         CardTitle,
         toast,
         useAppForm } from '@pkg/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { z } from 'zod';

export const Route = createFileRoute('/_public/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: z.object({
        email: z.email('올바른 이메일 형식을 입력해주세요.'),
      }),
    },
    onSubmit: async () => {
      toast.success('비밀번호 재설정 안내를 위한 준비 화면입니다.');
    },
  });

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link
            to="/login"
            className="
              inline-flex items-center gap-2 text-sm font-medium text-slate-500
              transition-colors
              hover:text-slate-900
            "
          >
            <ArrowLeft className="size-4" />
            로그인으로 돌아가기
          </Link>

          <div className="flex items-center gap-2">
            <Mail />
            <span>비밀번호 찾기</span>
          </div>

          <CardTitle>비밀번호 재설정</CardTitle>
          <CardDescription>
            계정 이메일을 입력하면 재설정 안내를 받을 수 있습니다.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form.AppForm>
            <form.Layout className="grid gap-4" onSubmit={(e) => void form.handleSubmit(e)}>
              <form.AppField name="email">
                {(field) => (
                  <field.Input
                    label="이메일"
                    placeholder="name@company.com"
                    type="email"
                    autoComplete="email"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    leftSide={<Mail />}
                  />
                )}
              </form.AppField>

              <form.Submit className="w-full">
                안내 메일 보내기
                <ArrowRight />
              </form.Submit>
            </form.Layout>
          </form.AppForm>
        </CardContent>

        <CardFooter className="justify-center">
          <CardDescription>아직 백엔드 연결 전의 안내 화면입니다.</CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
