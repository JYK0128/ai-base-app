import { SetMetadata } from '@nestjs/common';

export const IS_PERSONAL_KEY = 'isPersonal';

/**
 * 리소스 소유자 본인만 접근 가능하도록 제한합니다.
 * AuthGuard에서 요청 파라미터의 userId와 현재 로그인한 유저의 ID를 비교합니다.
 */
export const Personal = () => SetMetadata(IS_PERSONAL_KEY, true);
