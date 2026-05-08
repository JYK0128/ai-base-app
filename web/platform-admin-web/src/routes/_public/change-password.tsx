import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';

import { useAuthControllerChangePasswordV1, useAuthControllerLogoutV1 } from '../../api/endpoints';
import { accessTokenAtom, isAuthenticatedAtom } from '../../stores/auth.store';

export const Route = createFileRoute('/_public/change-password')({
  component: ChangePassword,
});

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: Readonly<{
  label: string
  value: string
  onChange: (val: string) => void
  placeholder: string
}>) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative flex items-center">
        <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all outline-none text-slate-900 font-medium"
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  );
}

function ChangePassword() {
  const navigate = Route.useNavigate();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const setAccessToken = useSetAtom(accessTokenAtom);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { mutate: logout } = useAuthControllerLogoutV1({
    mutation: {
      onSuccess: () => {
        setAccessToken(null);
      },
    },
  });

  const { mutate: changePassword, isPending: isChanging } = useAuthControllerChangePasswordV1({
    mutation: {
      onSuccess: () => {
        logout();
      },
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isLoading = isChanging;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    changePassword({
      data: { currentPassword, newPassword, confirmPassword },
    });
  };

  return (
    <div className="grid place-items-center h-screen bg-slate-50 font-sans">
      <div className="grid grid-rows-[auto_1fr_auto] w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
        <header className="flex flex-col gap-2 mb-8">
          <button
            onClick={() => void navigate({ to: '/' })}
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
          <form onSubmit={handleSubmit} className="grid gap-5">
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter current password"
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Min. 6 characters"
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-type new password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 transition-all mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </main>

        <footer className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-400 font-medium">Secured by Platform Auth Service</p>
        </footer>
      </div>
    </div>
  );
}
