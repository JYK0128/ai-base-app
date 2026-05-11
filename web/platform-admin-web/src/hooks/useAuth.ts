import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

import { useAuthControllerRefreshV1 } from '../api/endpoints';
import { accessTokenAtom,
         isAuthenticatedAtom,
         isInitializedAtom,
         isRefreshingAtom,
         mustChangePasswordAtom,
         organizationIdAtom } from '../stores/auth.store';

export const useAuth = () => {
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const [isInitialized, setIsInitialized] = useAtom(isInitializedAtom);
  const [isRefreshing, setIsRefreshing] = useAtom(isRefreshingAtom);

  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const mustChangePassword = useAtomValue(mustChangePasswordAtom);
  const organizationId = useAtomValue(organizationIdAtom);

  const { mutate: refresh } = useAuthControllerRefreshV1({
    mutation: {
      onSuccess: ({ data }) => {
        setAccessToken(data.accessToken);
      },
      onSettled: () => {
        setIsInitialized(true);
        setIsRefreshing(false);
      },
    },
  });

  useEffect(() => {
    // 1. 이미 토큰이 있으면 초기화 완료
    if (accessToken) {
      setIsInitialized(true);
      return;
    }

    // 2. 초기화 전이고 진행 중이 아니면 리프레시 시도
    if (!isInitialized && !isRefreshing) {
      setIsRefreshing(true);
      refresh();
    }
  }, [accessToken, isInitialized, isRefreshing, refresh, setIsInitialized, setIsRefreshing]);

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
    organizationId,
    isInitializing: !isInitialized,
    setAccessToken,
    login,
    logout,
  };
};
