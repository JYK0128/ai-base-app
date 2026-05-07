import axios from 'axios';
import { useEffect, useState } from 'react';

import { useAuth } from '../stores/auth.store';

export const useInitAuth = () => {
  const { setAccessToken } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 앱이 처음 켜지거나 새로고침 될 때 토큰을 무조건 한번 받아오려고 시도합니다.
        // 쿠키에 refreshToken이 있다면 서버가 새 토큰을 줍니다.
        // 응답 타입을 지정하여 Unsafe any 에러 해결
        const res = await axios.post<{ accessToken: string }>(
          'http://localhost:3000/api/auth/refresh', // 실제 백엔드 주소로 수정
          {},
          { withCredentials: true },
        );

        setAccessToken(res.data.accessToken);
      }
      catch (error: unknown) {
        // refreshToken이 없거나 만료된 상태이므로 아무 조치도 하지 않습니다.
        // 상태는 그대로 로그인 안된 상태(null)로 남습니다.
        if (axios.isAxiosError(error)) {
          console.log(`초기 로그인 실패: ${error.message}`);
        }
        else {
          console.log('초기 로그인 상태가 아닙니다.');
        }
      }
      finally {
        // 성공하든 실패하든 초기화 시도가 끝났음을 알립니다.
        setIsInitializing(false);
      }
    };

    void initAuth();
  }, [setAccessToken]);

  return { isInitializing };
};
