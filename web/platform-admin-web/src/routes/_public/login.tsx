import { createFileRoute, Navigate } from '@tanstack/react-router';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, mustChangePassword } = useAuth();

  const { mutate: loginMutate } = useAuthControllerLoginV1({
    mutation: {
      onSuccess: ({ data }) => {
        // 상태만 업데이트합니다. 이동은 아래의 조건부 렌더링에서 처리합니다.
        login(data.accessToken);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutate({ data: { email, password } });
  };

  // 로그인 성공 시 상황에 맞는 페이지로 리다이렉트
  if (isAuthenticated) {
    const target = mustChangePassword ? '/change-password' : (redirect || '/dashboard');

    return <Navigate to={target} />;
  }

  return (
    <div className="grid place-items-center h-screen bg-slate-50 font-sans">
      <div className="grid grid-rows-[auto_1fr_auto] w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
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
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="group flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all mt-2"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </main>

        <footer className="flex flex-row items-center justify-between mt-10 pt-8 border-t border-slate-50">
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
