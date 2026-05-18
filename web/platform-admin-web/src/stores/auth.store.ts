import { decodeJwt, type JWTPayload } from 'jose';
import { atom } from 'jotai';

// accessToken을 저장하는 기본 atom
export const accessTokenAtom = atom<string | null>(null as string | null);

// 초기화 여부를 저장하는 기본 atom
export const isInitializedAtom = atom(false);

// 리프레시 진행 여부를 저장하는 기본 atom
export const isRefreshingAtom = atom(false);

// 토큰에서 정보를 추출하는 헬퍼 함수
const getPayload = (token: string | null): JWTPayload => {
  if (!token) return {};
  try {
    return decodeJwt(token);
  }
  catch (e) {
    console.error('[AuthStore] Failed to decode token', e);
    return {};
  }
};

// 비밀번호 변경 필요 여부를 계산하는 파생 atom
export const mustChangePasswordAtom = atom((get) => {
  const payload = getPayload(get(accessTokenAtom));
  return !!payload?.mustChangePassword;
});

// 조직 ID를 추출하는 파생 atom
export const organizationIdAtom = atom((get) => {
  const payload = getPayload(get(accessTokenAtom));
  return (payload?.organizationId as string) || null;
});

// 파생 atom (로그인 여부 확인용)
export const isAuthenticatedAtom = atom((get) => get(accessTokenAtom) !== null);

// 권한 목록을 추출하는 파생 atom
export const permissionsAtom = atom((get) => {
  const payload = getPayload(get(accessTokenAtom));
  return (payload?.permissions as string[]) || [];
});
