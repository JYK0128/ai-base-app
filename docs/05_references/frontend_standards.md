# 프론트엔드 개발 표준 (요약)

## 1. 기술 스택 표준

* **Framework**: TanStack Start / React 기반 풀스택 구조
* **State/Style**: TanStack Query(서버 상태), Tailwind CSS(토큰 기반), Radix UI(접근성 컴포넌트)

## 2. UI/UX 및 디자인 원칙

* **Premium UX**: Glassmorphism 및 고품질 미세 애니메이션을 적용한 생동감 있는 인터페이스
* **Responsive**: Mobile-First 기반의 전 기기 대응 반응형 레이아웃 필수

## 3. 구현 및 성능 표준

* **Customization**: CSS Variable 기반의 파트너사 브랜드 테마 커스터마이징 시스템
* **Performance**: LCP 2.5초 이내 목표 및 이미지 최적화, 레이지 로딩 적용
* **Error**: 전역 Error Boundary를 활용한 사용자 친화적 Fallback UI 제공

## 4. 데이터 연동 규칙

* **Interceptor**: 모든 요청에 `Authorization` 및 `X-Tenant-ID` 자동 주입
* **Real-time**: 비즈니스 요구에 따른 SSE/WebSocket 표준 연동 규칙 준수
