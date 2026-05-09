import { Button,
         Card,
         CardContent,
         CardDescription,
         CardFooter,
         CardHeader,
         CardTitle,
         useAppForm } from '@pkg/ui';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { z } from 'zod';

import { useAuthControllerLoginV1 } from '../../api/endpoints';
import { useAuth } from '../../stores/auth.store';

export const Route = createFileRoute('/_public/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const { login, isAuthenticated, mustChangePassword } = useAuth();

  const { mutate: loginMutate } = useAuthControllerLoginV1({
    mutation: {
      onSuccess: ({ data }) => {
        login(data.accessToken);
      },
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: z.object({
        email: z.email('올바른 이메일 형식을 입력해주세요.'),
        password: z.string().min(1, '비밀번호를 입력해주세요.'),
      }),
    },
    onSubmit: async ({ value }) => {
      loginMutate({ data: value });
    },
  });

  if (isAuthenticated) {
    const target = mustChangePassword ? '/change-password' : (redirect || '/dashboard');
    return <Navigate to={target} />;
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock />
            <span>PLATFORM</span>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Please enter your details to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form.AppForm>
            <form.Layout className="grid gap-4" onSubmit={(e) => void form.handleSubmit(e)}>
              <form.AppField
                name="email"
              >
                {(field) => (
                  <field.Input
                    label="Email Address"
                    placeholder="name@company.com"
                    type="email"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    leftSide={<Mail />}
                  />
                )}
              </form.AppField>

              <form.AppField
                name="password"
              >
                {(field) => (
                  <field.Input
                    label="Password"
                    placeholder="••••••••"
                    type="password"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    leftSide={<Lock />}
                  />
                )}
              </form.AppField>

              <form.Submit className="w-full">
                Sign In
                <ArrowRight />
              </form.Submit>
            </form.Layout>
          </form.AppForm>
        </CardContent>

        <CardFooter className="flex-col justify-between gap-2 sm:flex-row">
          <Button type="button" variant="ghost">
            Forgot Password?
          </Button>
          <div className="flex items-center gap-2">
            <CardDescription>New here?</CardDescription>
            <Button type="button" variant="link">
              Create Account
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
