import { decodeJwt } from 'jose';
import { atom, useAtom } from 'jotai';

// accessToken을 저장하는 기본 atom
export const accessTokenAtom = atom<string | null>(null);

// 비밀번호 변경 필요 여부를 계산하는 파생 atom
export const mustChangePasswordAtom = atom((get) => {
  const token = get(accessTokenAtom);
  if (!token) return false;
  try {
    const payload = decodeJwt(token);
    console.log('[AuthStore] Decoded Payload:', payload);
    const mustChange = !!payload?.mustChangePassword;
    console.log('[AuthStore] mustChangePassword:', mustChange);
    return mustChange;
  }
  catch (e) {
    console.error('[AuthStore] Failed to decode token', e);
    return false;
  }
});

// 파생 atom (로그인 여부 확인용)
export const isAuthenticatedAtom = atom((get) => get(accessTokenAtom) !== null);

// Context처럼 사용할 수 있는 커스텀 훅
export const useAuth = () => {
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [mustChangePassword] = useAtom(mustChangePasswordAtom);

  const login = (token: string) => {
    setAccessToken(token);
  };

  const logout = () => {
    setAccessToken(null);
  };

  return {
    accessToken,
    isAuthenticated,
    mustChangePassword,
    setAccessToken,
    login,
    logout,
  };
};
