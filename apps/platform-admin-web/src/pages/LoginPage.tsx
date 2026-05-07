import axios from 'axios';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';

import { apiClient } from '../lib/axios';
import { useAuth } from '../stores/auth.store';
import { AuthData } from './ChangePasswordPage';

/**
 * LoginPage 컴포넌트
 * Atomic Layout Guide 규칙 적용:
 * - 세로 배치는 grid-rows-[auto_1fr] 또는 grid 활용
 * - 가로 배치는 flex 활용
 */
interface LoginPageProps {
  onSuccess: (data: AuthData) => void
  onPasswordChangeRequired: (email: string, authData?: AuthData) => void
}

interface ErrorResponseData {
  error?: {
    code?: string
    details?: AuthData
    message?: string
  }
  message?: string
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onPasswordChangeRequired }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // 방금 만든 Jotai 커스텀 훅 가져오기

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });

    try {
      // apiClient를 사용하여 서버에 로그인 요청을 보냅니다.
      const response = await apiClient.post<AuthData>('/v1/auth/login', { email, password });

      console.log('Login successful:', response.data);

      // Jotai 상태에 accessToken 저장 (apiClient 인터셉터가 이후 요청에 알아서 첨부함)
      if (response.data.accessToken) {
        login(response.data.accessToken);
      }

      alert('로그인 성공!');
      onSuccess(response.data);
    }
    catch (error) {
      console.error('Login failed:', error);

      if (axios.isAxiosError<ErrorResponseData>(error)) {
        const errorData = error.response?.data;

        if (errorData?.error?.code === 'PASSWORD_CHANGE_REQUIRED') {
          alert('보안 정책에 따라 비밀번호 변경이 필요합니다.');
          onPasswordChangeRequired(email, errorData.error.details);
          return;
        }

        const errorMsg = errorData?.error?.message || errorData?.message || '알 수 없는 오류';
        alert(`로그인 실패: ${errorMsg}`);
        return;
      }

      alert('네트워크 오류가 발생했습니다. 서버가 실행 중인지 확인해 주세요.');
    }
  };

  return (
    <div className="grid place-items-center h-screen bg-slate-50 font-sans">
      {/* Login Card: 세로 구조는 grid로 정의 */}
      <div className="grid grid-rows-[auto_1fr_auto] w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">

        {/* 1. Header Area (auto) */}
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

        {/* 2. Form Area (1fr) - 내부 요소도 grid로 세로 배치 */}
        <main className="grid gap-6">
          <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-5">
            {/* Email Field (auto) */}
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

            {/* Password Field (auto) */}
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

            {/* Submit Button (auto) */}
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all mt-2"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </main>

        {/* 3. Footer Area (auto) - 가로 배치는 flex로 처리 */}
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
};

export default LoginPage;
