import { atom } from 'jotai';

// accessToken을 저장하는 기본 atom
export const accessTokenAtom = atom<string | null>(null as string | null);

// 초기화 여부를 저장하는 기본 atom
export const isInitializedAtom = atom(false);

// 리프레시 진행 여부를 저장하는 기본 atom
export const isRefreshingAtom = atom(false);

// 파생 atom (로그인 여부 확인용)
export const isAuthenticatedAtom = atom((get) => get(accessTokenAtom) !== null);
