import { useEffect, useState } from 'react';

import { useAuthControllerRefreshV1 } from '../api/endpoints';
import { useAuth } from '../stores/auth.store';

export const useSession = () => {
  const { setAccessToken, accessToken } = useAuth();
  const [isDone, setIsDone] = useState(false);
  const { mutate: refresh, isPending } = useAuthControllerRefreshV1({
    mutation: {
      onSuccess: ({ data }) => {
        setAccessToken(data.accessToken);
      },
      onSettled: () => {
        setIsDone(true);
      },
    },
  });

  useEffect(() => {
    // 액세스 토큰이 이미 있는 경우 즉시 완료 처리
    if (accessToken) {
      setIsDone(true);
      return;
    }

    // 이미 완료되었거나 진행 중인 경우 중복 호출 방지
    if (isDone || isPending) {
      return;
    }

    refresh();
  }, [refresh, isDone, isPending, accessToken]);

  return { isInitializing: !isDone };
};
