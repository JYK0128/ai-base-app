# 백엔드 개발 표준 (요약)

## 1. 아키텍처 원칙

* **Stateless**: 모든 세션 정보를 외부 저장소(Redis) 및 토큰으로 관리
* **Database per Service**: 서비스별 독립 DB 운영 및 Platform DB 참조 분리
* **Event-driven**: 도메인 이벤트를 통한 비동기 데이터 동기화 지향

## 2. 데이터 처리 표준

* **격리**: Tenant ID 기반의 Row-Level Security(RLS) 적용 필수
* **무결성**: DB 트랜잭션과 메시지 발행의 원자성 보장 (Outbox 패턴)
* **관리**: 물리적 삭제 금지, `deleted_at` 필드를 활용한 논리적 삭제 적용

## 3. 안정성 및 보안

* **Resiliency**: 서비스 간 장애 전파 차단(Circuit Breaker) 및 호출 제한(Rate Limit)
* **보안/감사**: 민감 정보 암호화(Argon2) 및 데이터 변경 이력 불변 기록(Audit Trail)
