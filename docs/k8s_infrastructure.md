# Kubernetes (K8s) 인프라 설계서 (MVP Edition)

## 1. 아키텍처 개요

AWS EKS를 사용하여 최소한의 비용으로 서비스를 구동합니다.

## 2. 배포 구조

* **Namespace**: `Marketplace` 단일 네임스페이스 사용.
* **Nodes**: t3.medium 또는 t3.large 기반의 Managed Node Group 사용.

## 3. 마이크로서비스 배포

* Core, Auth, Program, Billing, Infra 등 5개 서비스를 Deployment로 배포.
* 각 서비스당 최소 2개의 파드(Pod)를 유지하여 가용성 확보.

## 4. 로드밸런싱 및 네트워크

* **AWS ALB**: 인터넷 트래픽을 각 서비스로 분산.
* **HPA**: CPU 사용량 80% 이상 시 파드 자동 확장.

## 5. 보안 및 설정 관리

* **ConfigMap/Secret**: 어플리케이션 환경변수 및 DB 접속 정보 관리.
* **Health Check**: `/health` 경로를 통한 표준 Liveness/Readiness 체크.

## 6. DB 및 영속성 레이어

* **AWS RDS**: 표준 Postgres 인스턴스 사용 및 야간 자동 백업.
* **AWS ElastiCache**: 세션 및 캐싱용 Redis 사용.
