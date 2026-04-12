# 인프라 관리 표준 (Infrastructure Standards)

본 문서는 프로젝트 내 모든 인프라 자원(애플리케이션 배포, 미들웨어, 네트워크 등)의 구성 및 운영에 관한 라이프사이클 관리 표준을 정의함.

## 1. 폴더 구조 (Directory Structure)

- **목적**: 인프라 자원 역할별 최상위 카테고리 분류 및 기술 단위 하위 구성
- **구조**:
  - `apps/`: 비즈니스 로직 애플리케이션 명세 (예: platform-auth, gateway)
  - `database/`: 상태 저장소 기술 명세 (예: postgres, redis, mongodb)
  - `messaging/`: 메시지 브로커 및 큐 명세 (예: rabbitmq, kafka)
  - `networking/`: 네트워크 및 서비스 메쉬 설정 명세 (예: istio, ingress, dns)
  - `monitoring/`: 메트릭 및 시각화 도구 명세 (예: grafana, prometheus)
  - `logging/`: 로그 수집 및 분석 도구 명세 (예: loki, elasticsearch)

## 2. 명명 표준 (Naming Standards)

### 2.1 공용 인프라 (Shared Infrastructure)

- **위치**: 기술 단위의 개별 하위 폴더 (예: `.k8s/messaging/rabbitmq/`)
- **관리**: 리소스 종류별 파일 분리 관리 지향
- **파일명**: `[기술명]-[리소스종류].yaml`
- **예시**: `rabbitmq-deployment.yaml`, `rabbitmq-service.yaml`

### 2.2 비즈니스 애플리케이션 (Business Applications)

- **위치**: `apps/` 폴더 하위 직접 위치
- **관리**: Deployment와 Service를 단일 파일로 병합 관리 (운영 효율성)
- **파일명**: `[앱이름].yaml`
- **예시**: `platform-auth-service.yaml`

## 3. 리소스 구성 및 운영 원칙

- **도메인 중심 배정**: 특정 기술에 종속된 설정은 해당 기술 폴더 또는 전용 네트워크 폴더에 위치함
- **보안 정보 관리**: Secret 정보의 직접 기입을 금지하며, 별도 Secret 리소스 또는 외부 주입 시스템 활용함
- **서비스 식별**: 클러스터 내부 통신 시 가급적 쿠버네티스 내부 DNS 주소 사용함 (예: `rabbitmq.default.svc.cluster.local`)

---
*최종 업데이트: 2026-04-11*
