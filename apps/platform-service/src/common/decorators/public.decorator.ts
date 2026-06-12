import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * JWT 인증 및 권한 체크를 건너뛰고 싶을 때 사용합니다.
 * Public으로 지정된 컨트롤러/메소드는 AuthGuard의 확인 절차를 통과합니다.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
