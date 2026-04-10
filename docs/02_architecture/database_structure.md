# 데이터베이스 아키텍처 및 구조 설계 (요약)

## 1. 멀티 테넌시 격리 전략

* **기본 모델**: Shared Database & Shared Schema 기반의 효율적 운영
* **데이터 격리**: Row-Level Security(RLS)와 `tenant_id` 필드를 통한 논리적 분리
* **엔터프라이즈**: 필요 시 Isolated Database(물리 격리) 인스턴스 할당 가능

## 2. 스키마 레이어 구성

* **Platform Schema**:
  * **platform_accounts**: 플랫폼 전용 식별 계정 (Admin/Staff용 SSO)
  * **partners**: 파트너사 마스터 정보 및 인프라 설정
  * **platform_users**: 운영진 및 파트너 관리자 (platform_accounts와 매핑)
  * **memberships**: 구독 정책 및 할당량 관리
* **Tenant Schema**:
  * **tenant_accounts**: 서비스 전용 식별 계정 (End User용 SSO)
  * **tenant_users**: 서비스 최종 사용자 프로필 (tenant_accounts와 매핑)
  * **transactions**: 서비스 이용 및 거래 내역
* **Observability**: 이벤트 발행 큐, 변경 이력(CDC), 감사 로그(Audit), 보안 이벤트 로그

## 3. 데이터 무결성 및 성능 전략

* **데이터 정합성**: Transactional Outbox 및 Saga 패턴을 통한 분산 트랜잭션 관리
* **변경 전파**: CDC(Change Data Capture)를 활용한 실시간 서비스 간 데이터 연동
* **이력 관리**: 모든 중요 데이터에 논리적 삭제(Soft Delete) 및 감사 기록 필수 적용
* **최적화**: 모든 테넌트 관련 쿼리에 `tenant_id` 선행 복합 인덱스 적용
