import { useAppForm } from '@pkg/ui';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

import { useAuthControllerChangePasswordV1, useAuthControllerLogoutV1 } from '../../api/endpoints';
import { isAuthenticatedAtom, useAuth } from '../../stores/auth.store';

export const Route = createFileRoute('/_public/change-password')({
  component: ChangePassword,
});

function ChangePassword() {
  const navigate = Route.useNavigate();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const { logout: authLogout } = useAuth();

  const { mutate: logoutMutate } = useAuthControllerLogoutV1({
    mutation: {
      onSuccess: () => {
        authLogout();
      },
    },
  });

  const { mutate: changePasswordMutate, isPending: isChanging } = useAuthControllerChangePasswordV1({
    mutation: {
      onSuccess: () => {
        logoutMutate();
      },
    },
  });

  const form = useAppForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: z.object({
        currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
        newPassword: z.string().min(6, '새 비밀번호는 최소 6자 이상이어야 합니다.'),
        confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: '새 비밀번호가 일치하지 않습니다.',
        path: ['confirmPassword'],
      }),
    },
    onSubmit: async ({ value }) => {
      changePasswordMutate({ data: value });
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="grid place-items-center h-screen bg-slate-50 font-sans">
      <div className="grid grid-rows-[auto_1fr_auto] w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
        <header className="flex flex-col gap-2 mb-8">
          <button
            onClick={() => void navigate({ to: '/login' })}
            className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold">Back to Login</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">SECURITY</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">Change Password</h1>
          <p className="text-slate-500 font-medium">
            Please update your password to secure your account.
          </p>
        </header>

        <main className="grid gap-6">
          <form.AppForm>
            <form.Layout onSubmit={(e) => void form.handleSubmit(e)}>
              <form.AppField name="currentPassword">
                {(field) => (
                  <field.Input
                    label="Current Password"
                    placeholder="Enter current password"
                    type="password"
                    required
                    orientation="vertical"
                    className="grid gap-2"
                    labelWidth="auto"
                    leftSide={(
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  />
                )}
              </form.AppField>

              <form.AppField name="newPassword">
                {(field) => (
                  <field.Input
                    label="New Password"
                    placeholder="Min. 6 characters"
                    type="password"
                    required
                    orientation="vertical"
                    className="grid gap-2"
                    labelWidth="auto"
                    leftSide={(
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  />
                )}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.Input
                    label="Confirm New Password"
                    placeholder="Re-type new password"
                    type="password"
                    required
                    orientation="vertical"
                    className="grid gap-2"
                    labelWidth="auto"
                    leftSide={(
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  />
                )}
              </form.AppField>

              <form.Submit
                disabled={isChanging}
                className="group flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 transition-all mt-2 h-auto text-base disabled:opacity-50"
              >
                {isChanging ? 'Updating...' : 'Update Password'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </form.Submit>
            </form.Layout>
          </form.AppForm>
        </main>

        <footer className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-400 font-medium">Secured by Platform Auth Service</p>
        </footer>
      </div>
    </div>
  );
}
