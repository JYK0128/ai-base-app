# 백엔드 아키텍처 상세 사양서 (Enterprise MSA Edition)

## 1. 아키텍처 개요

플랫폼의 확장성과 독립적 배포를 위해 **마이크로서비스 아키텍처(MSA)**를 기본 구조로 채택하며, 실용적 운영을 위해 도메인 간의 느슨한 결합(Loose Coupling)과 강력한 데이터 정합성을 지향합니다.

## 2. 기술 스택 표준 (Standard Tech Stack)

* **Framework**: **NestJS** (Modular & Enterprise-ready)
* **ORM**: **Mikro-ORM** (Data Mapper & Unit of Work pattern)
* **Database**: **PostgreSQL** (Core Data) & **Redis** (Cache/Session)
* **Messaging**: **RabbitMQ** (Asynchronous Event-driven)
* **Security**: Passport.js + JWT (Authentication & RBAC)

## 3. 핵심 아키텍처 전략

### 3.1. 멀티테넌트 데이터 격리 (Multi-tenant Isolation)

* **Organization Context**: 모든 요청 파이프라인에서 `organizationId`를 식별하며, Mikro-ORM의 **Global Filters** 기능을 통해 모든 데이터 조회 시 해당 테넌트의 데이터만 노출되도록 강제합니다. (관리자 실수에 의한 데이터 유출 방지)
* **Atomic Transactions**: **Unit of Work**를 통해 복잡한 비즈니스 로직에서도 트랜잭션의 원자성을 완벽하게 보장합니다.

### 3.2. 서비스 간 정합성 유지 (Consistency)

* **Transactional Outbox Pattern**: 데이터베이스 변경과 이벤트 발행을 하나의 로컬 트랜잭션으로 묶어, 네트워크 장애가 발생하더라도 메시지 유실 없는 **최종적 일관성(Eventual Consistency)**을 실현합니다.
* **Saga Pattern (Orchestration)**: 구독 신청 -> 인보이스 생성 -> 결제 요청 등 여러 지연이 발생하는 트랜잭션의 경우, 상태 기반 오케스트레이션을 통해 실패 시 자동 보상 트랜잭션을 실행합니다.

### 3.3. API 통신 및 보안 표준

* **OpenAPI Integration**: 모든 서비스는 Swagger를 통해 명세를 자동 생성하며, 이를 기반으로 **TanStack Start** 프론트엔드와 실시간 타입 동기화를 수행합니다.
* **OAuth2/JWT Auth**: `Auth Service`에서 발행한 JWT를 각 서비스가 지연 호출 없이 독립적으로 검증(Stateless Verification)하여 성능을 최적화합니다.

### 3.4. 비즈니스 로직 보호 (Guardrails)

* **Validation Pipe**: 모든 입력값은 **Zod** 또는 **class-validator**를 통해 진입 단계에서 검증됩니다.
* **Global Exception Filter**: RFC 7807 표준 에러 포맷으로 응답을 통일하여 클라이언트의 에러 처리를 단순화합니다.

## 4. 인프라 및 운영

* **Containerized Deployment**: 모든 마이크로서비스는 Docker 컨테이너 및 Kubernetes(EKS) 환경에서 독립적으로 배포 및 스케일링됩니다.
* **Config Management**: AWS Secrets Manager와 연동하여 환경별 민감 설정 정보를 안전하게 관리합니다.
