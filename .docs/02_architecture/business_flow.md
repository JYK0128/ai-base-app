# 핵심 비즈니스 흐름 (요약)

## 1. 파트너 온보딩 (Provisioning)

* **흐름**: 가입 요청 → 파트너 마스터/스키마 생성 → 리소스 할당(K8s) → 온보딩 완료
* **티어**: Explorer(공유 인프라 즉시 가용), 유료 티어(전용 리소스/프로비저닝)

## 2. 파트너 멤버 초대 (Invitation)

* **흐름**: 멤버 초대(Email/Role) → 초대 토큰 저장/메일 발송 → 초대 수락(토큰 검증) → 테넌트 멤버 등록 및 RBAC 설정

## 3. 보안 API 호출 (Secure API Flow)

* **흐름**: API 요청(JWT) → Gateway 검증 → Auth 서비스(Tenant ID 추출) → 서비스 처리(Tenant ID 기반 RLS 쿼리) → 격리 데이터 반환

## 4. 데이터 일관성 및 이벤트 전파 (Consistency)

* **흐름**: 비즈니스 데이터 수정(Atomic Transaction) → 변경 로직 감지(CDC/Outbox) → Event Bus 이벤트 발행 → 감사 로그 적재 및 타 서비스 동기화

## 5. 장애 복구 (Fault Tolerance)

* **서킷 브레이커**: 장애 발생 시 즉시 차단 및 Fallback 제공으로 장애 전파 방지
* **재시도 정책**: 일시적 오류 시 자동 재시도 및 지수 백오프 적용
