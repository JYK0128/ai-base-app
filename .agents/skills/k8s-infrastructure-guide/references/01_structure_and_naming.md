# 구조 및 네이밍 규칙 (Structure & Naming Rules)

## 1. 하이브리드 관리 규칙 (Hybrid Management Rules)

- **Helm 역할**:
  - 컨트롤 플레인(Control Plane), 오퍼레이터(Operators), 서비스 메쉬(Istio) 등 제어 계층 설치 및 관리에 한하여 사용함
- **Kustomize 역할**:
  - 데이터 플레인(Data Plane), 데이터베이스 인스턴스, 개별 애플리케이션 명세 및 환경별(dev, prod) 설정 수정에 사용함

---

## 2. 디렉토리 구조 표준 (Directory Structure)

- **`namespaces/`**: 클러스터 네임스페이스 정의를 관리함
- **`networking/`**: 글로벌 보안 정책(Zero-Trust NetworkPolicy) 및 Ingress/Egress 라우팅 설정을 관리함
- **`apps/`**: 비즈니스 애플리케이션 서비스의 ConfigMap, Secret, Deployment, Service 명세를 관리함
- **`database/`**: Postgres, Redis 등 상태 저장소 인스턴스 및 볼륨 명세를 관리함
- **`messaging/`**: RabbitMQ 등 메시지 브로커 인프라 명세를 관리함
- **`monitoring/`**: Loki, Grafana, Alloy 등 시스템 관측성 도구 및 알림(Alerting) 명세를 관리함
- **`overlays/`**: `dev`, `prod` 환경별 리소스 병합 및 수정 설정을 관리함

---

## 3. 명명 규칙 (Naming Conventions)

- **리소스 파일 명명**:
  - `[서비스명]-[리소스종류].yaml` 포맷을 강제함
  - **올바른 예**: `mimir-cm.yaml`, `platform-gateway-svc.yaml`, `postgres-backup-pvc.yaml`
- **NetworkPolicy 파일 명명**:
  - `[방향]-[출발지]-[전치사]-[목적지].yaml` 포맷을 강제함
  - **올바른 예**: `egress-platform-gateway-to-infra.yaml`, `ingress-redis-from-platform-services.yaml`
- **리소스 이름의 환경명 배제**:
  - 리소스 이름 자체에 환경 접두사/접미사(`dev-`, `-prod` 등) 포함을 금지함
  - 개발(dev)과 운영(prod)의 물리적 환경 분리는 네임스페이스(Namespace) 지정을 통해서만 관리함
