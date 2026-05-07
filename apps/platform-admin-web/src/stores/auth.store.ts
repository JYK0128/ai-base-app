import { atom, useAtom } from 'jotai';

// accessToken을 저장하는 기본 atom
export const accessTokenAtom = atom<string | null>(null);

// 파생 atom (선택 사항: 로그인 여부 확인용)
export const isAuthenticatedAtom = atom((get) => get(accessTokenAtom) !== null);

// Context처럼 사용할 수 있는 커스텀 훅
export const useAuth = () => {
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  const login = (token: string) => {
    setAccessToken(token);
  };

  const logout = () => {
    setAccessToken(null);
  };

  return {
    accessToken,
    isAuthenticated,
    setAccessToken,
    login,
    logout,
  };
};
