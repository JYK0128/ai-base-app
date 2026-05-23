import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getStoredAdminLocale, normalizeAdminLocale } from './locale';

const resources = {
  ko: {
    common: {
      appName: '플랫폼 관리자',
      loadingAuth: '인증 정보를 확인 중입니다...',
      errorTitle: '오류가 발생했습니다',
      errorDescription: '시스템에 일시적인 문제가 발생했거나 예상치 못한 오류가 있습니다. 아래 버튼을 눌러 다시 시도해 주세요.',
      retry: '다시 시도',
      notFoundTitle: '페이지를 찾을 수 없습니다',
      notFoundDescription: '요청하신 페이지가 존재하지 않거나, 해당 페이지에 접근할 수 있는 권한이 없습니다. 입력하신 주소가 올바른지 확인해 주세요.',
      goHome: '홈으로 이동',
      logout: '로그아웃',
      loginBrand: '플랫폼',
      loginTitle: '다시 오신 것을 환영합니다',
      loginSubtitle: '로그인 정보를 입력해 주세요.',
      loginEmail: '이메일 주소',
      loginPassword: '비밀번호',
      loginSubmit: '로그인',
      loginForgotPassword: '비밀번호를 잊으셨나요?',
      loginNewHere: '처음이신가요?',
      loginCreateAccount: '계정 만들기',
      changePasswordBack: '로그인으로 돌아가기',
      changePasswordBrand: '보안',
      changePasswordTitle: '비밀번호 변경',
      changePasswordSubtitle: '계정을 안전하게 사용하려면 비밀번호를 변경해 주세요.',
      currentPassword: '현재 비밀번호',
      newPassword: '새 비밀번호',
      confirmNewPassword: '새 비밀번호 확인',
      currentPasswordPlaceholder: '현재 비밀번호를 입력해 주세요',
      newPasswordPlaceholder: '최소 6자 이상',
      confirmNewPasswordPlaceholder: '새 비밀번호를 다시 입력해 주세요',
      updatePassword: '비밀번호 변경',
      updatingPassword: '변경 중...',
      securedBy: 'Platform Auth Service로 보호됩니다.',
    },
  },
  en: {
    common: {
      appName: 'Platform Admin',
      loadingAuth: 'Checking authentication...',
      errorTitle: 'Something went wrong',
      errorDescription: 'A temporary issue occurred or an unexpected error happened. Please try again.',
      retry: 'Try again',
      notFoundTitle: 'Page not found',
      notFoundDescription: 'The page you requested does not exist or you do not have permission to access it. Please check the address.',
      goHome: 'Go home',
      logout: 'Logout',
      loginBrand: 'Platform',
      loginTitle: 'Welcome back',
      loginSubtitle: 'Enter your sign-in details.',
      loginEmail: 'Email address',
      loginPassword: 'Password',
      loginSubmit: 'Sign in',
      loginForgotPassword: 'Forgot password?',
      loginNewHere: 'New here?',
      loginCreateAccount: 'Create account',
      changePasswordBack: 'Back to login',
      changePasswordBrand: 'Security',
      changePasswordTitle: 'Change password',
      changePasswordSubtitle: 'Update your password to keep your account secure.',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmNewPassword: 'Confirm new password',
      currentPasswordPlaceholder: 'Enter current password',
      newPasswordPlaceholder: 'At least 6 characters',
      confirmNewPasswordPlaceholder: 'Re-enter the new password',
      updatePassword: 'Update password',
      updatingPassword: 'Updating...',
      securedBy: 'Protected by Platform Auth Service.',
    },
  },
} as const;

const initialLanguage = normalizeAdminLocale(getStoredAdminLocale());

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'ko',
    defaultNS: 'common',
    ns: ['common', 'resource'],
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;

export function setAdminLanguage(locale: string) {
  const nextLocale = normalizeAdminLocale(locale);
  void i18n.changeLanguage(nextLocale);
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_lang', nextLocale);
  }
  return nextLocale;
}

