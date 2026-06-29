import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { type AuthControllerMeV1QueryResult, getAuthControllerMeV1QueryKey, useAuthControllerLogoutV1, useAuthControllerMeV1 } from '@/api/generated/endpoints';
import { type ApiResponse, ErrorInfoCode } from '@/api/generated/model';
import { clearCsrfToken } from '@/lib/axios';

export const useSession = () => {
  const queryClient = useQueryClient();
  const { refetch, isPending } = useAuthControllerMeV1();
  const { mutateAsync: logoutAsync } = useAuthControllerLogoutV1();
  const authQueryKey = getAuthControllerMeV1QueryKey();

  const getAuthErrorCode = () => {
    const error = queryClient.getQueryState(authQueryKey)?.error;

    if (isAxiosError<ApiResponse>(error)) {
      return error.response?.data.error?.code;
    }

    return undefined;
  };

  const getAuthData = () => queryClient
    .getQueryData<AuthControllerMeV1QueryResult>(authQueryKey);

  const clear = async () => {
    await logoutAsync();
    queryClient.removeQueries({ queryKey: authQueryKey });
    clearCsrfToken();
  };

  return {
    get data() {
      return getAuthData();
    },
    get isPending() {
      return isPending;
    },
    get isAuthenticated() {
      return !!getAuthData();
    },
    get isError() {
      return !!getAuthErrorCode();
    },
    get requiredPasswordChange() {
      return getAuthErrorCode() === ErrorInfoCode['PASSWORD_CHANGE_REQUIRED'];
    },
    get requiredAgreeTerms() {
      return getAuthErrorCode() === ErrorInfoCode['TERMS_AGREEMENT_REQUIRED'];
    },
    refresh: refetch,
    clear,
  };
};

export type SessionContext = ReturnType<typeof useSession>;
