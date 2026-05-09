import { useAppForm } from '@pkg/ui';
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
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-6 font-sans">
      <div className="grid grid-rows-[auto_1fr_auto] w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 sm:p-10 border border-slate-100">
        <header className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Lock className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">PLATFORM</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
        </header>

        <main className="grid gap-6">
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
                    className="grid gap-2"
                    labelWidth="auto"
                    leftSide={<Mail className="w-5 h-5 text-slate-400" />}
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
                    className="grid gap-2"
                    labelWidth="auto"
                    leftSide={<Lock className="w-5 h-5 text-slate-400" />}
                  />
                )}
              </form.AppField>

              <form.Submit className="group flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all mt-2 h-auto text-base">
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </form.Submit>
            </form.Layout>
          </form.AppForm>
        </main>

        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-8 border-t border-slate-50">
          <button className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
            Forgot Password?
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">New here?</span>
            <button className="text-sm font-bold text-indigo-600 hover:underline">
              Create Account
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
