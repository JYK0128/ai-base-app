# SignupPage 카드 레이아웃 고정 - 2026-07-10

## 📋 작업 체크리스트

- [ ] SignupPage 카드 및 콘텐츠 영역 고정
  - 시작: 2026-07-10 09:20
  - 완료: `[pending]`
- [ ] 내부 세로 스크롤 동작 적용
  - 시작: 2026-07-10 09:20
  - 완료: `[pending]`
  - 구현: `@pkg/ui`의 `ScrollArea` 적용
- [ ] 계정 및 프로필 입력을 공통 폼 컴포넌트로 전환
  - 시작: 2026-07-10 09:20
  - 완료: `[pending]`
  - 구현: `useAppForm`, `AppForm`, `AppField`, `field.Input` 적용
- [ ] Member 전화번호 필드 추가
  - 시작: 2026-07-10 09:20
  - 완료: `[pending]`
- [ ] 타입체크 및 린트 검증
  - 시작: 2026-07-10 09:20
  - 완료: `[pending]`

## 검증 결과

- `pnpm --filter=platform-admin-web exec tsc --noEmit`: 통과
- `pnpm --filter=platform-admin-web exec eslint src/routes/_public/signup.tsx`: 통과
- `pnpm --filter=platform-admin-web exec vite build`: 통과
- 커밋 생성 시 체크리스트 완료 해시 반영
