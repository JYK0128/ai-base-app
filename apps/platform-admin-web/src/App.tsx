import React, { useState } from 'react';

import { useInitAuth } from './hooks/useInitAuth';
import ChangePasswordPage, { AuthData } from './pages/ChangePasswordPage';
import LoginPage from './pages/LoginPage';

function App() {
  const { isInitializing } = useInitAuth();
  const [view, setView] = useState<'login' | 'change-password'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [authData, setAuthData] = useState<AuthData | undefined>(undefined);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="text-slate-400 font-medium">인증 정보를 확인 중입니다...</div>
      </div>
    );
  }

  const handleLoginSuccess = (data: AuthData) => {
    console.log('Main Dashboard entry with:', data);
    alert('대시보드로 이동합니다.');
  };

  const handlePasswordChangeRequired = (email: string, data?: AuthData) => {
    setUserEmail(email);
    setAuthData(data);
    setView('change-password');
  };

  const handlePasswordChangeSuccess = () => {
    setView('login');
  };

  return (
    <div className="w-full h-full">
      {view === 'login'
        ? (
          <LoginPage
            onSuccess={handleLoginSuccess}
            onPasswordChangeRequired={handlePasswordChangeRequired}
          />
        )
        : (
          <ChangePasswordPage
            email={userEmail}
            authData={authData}
            onBack={() => setView('login')}
            onSuccess={handlePasswordChangeSuccess}
          />
        )}
    </div>
  );
}

export default App;
