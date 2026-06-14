import { decodeJwt } from 'jose';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

import { useAuthControllerMeV1, useAuthControllerRefreshV1 } from '../api/endpoints';
import { accessTokenAtom,
         isAuthenticatedAtom,
         isInitializedAtom,
         isRefreshingAtom,
         mustAcceptTermsOverrideAtom } from '../stores/auth.store';

type AuthTokenClaims = {
  sub?: string
};

function decodeAuthToken(token: string | null): AuthTokenClaims | null {
  if (!token) return null;

  try {
    return decodeJwt(token) as AuthTokenClaims;
  }
  catch {
    return null;
  }
}

export const useAuth = () => {
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const [isInitialized, setIsInitialized] = useAtom(isInitializedAtom);
  const [isRefreshing, setIsRefreshing] = useAtom(isRefreshingAtom);
  const [mustAcceptTermsOverride, setMustAcceptTermsOverride] = useAtom(mustAcceptTermsOverrideAtom);

  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

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

  const tokenClaims = decodeAuthToken(accessToken);

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

  // 3. 현재 로그인되어 있으면 서버에서 상세 정보(Me) 조회
  const { data: meData, isLoading: isMeLoading } = useAuthControllerMeV1({
    query: {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5분 캐시
    },
  });

  const login = (token: string) => {
    setMustAcceptTermsOverride(null);
    setAccessToken(token);
  };

  const logout = () => {
    setMustAcceptTermsOverride(null);
    setAccessToken(null);
  };

  const user = meData?.data?.user;
  const accountId = user?.account?.id || tokenClaims?.sub || null;
  const memberId = user?.member?.id || null;
  const organizationId = user?.organization?.id || null;
  const permissions = user?.permissions || [];
  const mustChangePassword = user?.account?.isPasswordExpired ?? false;
  const mustAcceptTerms = mustAcceptTermsOverride ?? user?.mustAcceptTerms ?? false;
  const agreedTermsVersionIds = user?.agreedTermsVersionIds || [];
  const accountEmail = user?.account?.email || null;

  // 인증 상태 확인이 완료되지 않았거나, 인증되었는데 서버에서 정보를 조회 중인 경우 초기화 중으로 표출
  const isInitializing = !isInitialized || (isAuthenticated && isMeLoading);

  return {
    accessToken,
    isAuthenticated,
    mustChangePassword,
    mustAcceptTerms,
    agreedTermsVersionIds,
    accountId,
    memberId,
    organizationId,
    accountEmail,
    permissions,
    isInitializing,
    setAccessToken,
    setMustAcceptTermsOverride,
    login,
    logout,
  };
};
