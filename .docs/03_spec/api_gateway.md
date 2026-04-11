# 05. API 게이트웨이 스펙 (요약)

## 1. 개요

* 클라이언트 요청의 단일 접점으로 라우팅, 보안 및 공통 핵심 기능(Cross-cutting) 처리

## 2. 주요 기능

* **동적 라우팅**: 요청 경로별 서비스 매핑 및 로드 밸런싱 연동
* **통합 인증**: JWT 유효성 검증 및 테넌트 컨텍스트(`X-Tenant-ID`) 추출/전달
* **트래픽 제어**: 테넌트/IP 단위 Rate Limiting 및 SSL Termination 보장
* **관찰성**: 전역 `X-Request-ID` 부여 및 실시간 성능 메트릭 수집

## 3. 기술적 요구사항

* **Resiliency**: 하위 서비스 장애 시 서킷 브레이커 및 재시도 정책 자동 실행
* **Performance**: 고성능 Non-blocking I/O 기반의 초저지연 라우팅 처리

## 4. 주요 라우팅 정책

* `/api/v1/auth/*`: B2B/B2C 인증 서비스 매핑
* `/api/v1/partners/*`: 테넌트 관리 코어 서비스 연동
* `/api/v1/business/*`: 비즈니스 로직 서비스 연동 (Auth 필수)
