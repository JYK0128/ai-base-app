import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * 로그인이 필요 없는 공개 API임을 표시하는 데코레이터입니다.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
