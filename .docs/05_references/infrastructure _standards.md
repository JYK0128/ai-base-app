# 인프라 관리 표준 (Infrastructure Standards)

본 문서는 프로젝트 내 모든 인프라 자원(애플리케이션 배포, 미들웨어, 네트워크 등)의 구성 및 운영에 관한 라이프사이클 관리 표준을 정의함.

## 1. 폴더 구조 (Directory Structure)

- **목적**: 인프라 자원 역할별 최상위 카테고리 분류 및 기술 단위 하위 구성
- **구조**:
  - `namespaces/`: 네임스페이스 선언 (`dev-api`, `dev-web`, `dev-infra`, `monitoring`)
  - `network-policies/`: 기본 차단 및 서비스 간 허용 정책
  - `apps/`: 비즈니스 애플리케이션 명세 (예: `platform-auth-service`, `service-gateway`)
  - `database/`: 상태 저장소 기술 명세 (예: postgres, redis, mongodb)
  - `messaging/`: 메시지 브로커 및 큐 명세 (예: rabbitmq, kafka)
  - `networking/`: 네트워크 및 서비스 메쉬 설정 명세 (예: istio, ingress, dns)
  - `monitoring/`: 관측성 구성 (grafana, loki, mimir, tempo, promtail 등)

## 2. 명명 표준 (Naming Standards)

### 2.1 공용 인프라 (Shared Infrastructure)

- **위치**: 기술 단위의 개별 하위 폴더 (예: `.k8s/messaging/rabbitmq/`)
- **관리**: 리소스 종류별 파일 분리 관리 지향
- **파일명**: `[기술명]-[리소스종류].yaml`
- **예시**: `rabbitmq-deployment.yaml`, `rabbitmq-service.yaml`

### 2.2 비즈니스 애플리케이션 (Business Applications)

- **위치**: `apps/<app-name>/`
- **관리**: 리소스 역할별 파일 분리 관리
  - `deployment.yaml`
  - `service.yaml`
  - `configmap.yaml`
- **예시**: `.k8s/apps/platform-auth-service/deployment.yaml`

### 2.3 네임스페이스 및 정책 (Namespaces & Policies)

- **네임스페이스 파일 위치**: `.k8s/namespaces/`
  - 예: `dev-api.yaml`, `dev-web.yaml`, `dev-infra.yaml`, `monitoring.yaml`
- **네트워크 정책 파일 위치**: `.k8s/network-policies/`
  - 예: `default-deny.yaml`, `allow-dns-egress.yaml`, `allow-app-flows.yaml`

## 3. 리소스 구성 및 운영 원칙

- **도메인 중심 배정**: 특정 기술에 종속된 설정은 해당 기술 폴더 또는 전용 네트워크 폴더에 위치함
- **보안 정보 관리**: 평문 자격 증명은 애플리케이션 설정에 직접 기입 금지, Secret 리소스 또는 외부 주입 시스템 활용함
- **서비스 식별**: 클러스터 내부 통신은 쿠버네티스 내부 DNS 주소 사용함
  - 예: `rabbitmq.dev-infra.svc.cluster.local`
  - 예: `postgres-service.dev-infra.svc.cluster.local`
- **헬스체크 표준**
  - `startupProbe`: `/health/live`
  - `livenessProbe`: `/health/live`
  - `readinessProbe`: `/health/ready`
  - 앱 코드 health endpoint와 `.k8s` probe 경로는 동일하게 유지함

---
*최종 업데이트: 2026-04-13*
