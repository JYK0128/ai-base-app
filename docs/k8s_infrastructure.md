# Kubernetes (K8s) 인프라 설계서 (Cloud-Agnostic MVP)

## 1. 아키텍처 개요

특정 인프라 사업자에 종속되지 않고 어디서나 구동 가능한 표준 Kubernetes 환경을 구축합니다.

## 2. 배포 구조 (Standard K8s)

* **Namespace**: `Marketplace` 단일 네임스페이스 사용.
* **Nodes**: 표준 가상머신(VM) 기반의 노드 그룹 사용. (최소 3개 노드 이상 권장)

## 3. 로드밸런싱 및 인그레스 (Ingress)

* **Nginx Ingress Controller**: 범용 Nginx Ingress를 사용하여 내부 마이크로서비스로 트래픽을 라우팅합니다.
* **Cert-Manager**: 표준 ACME 프로토콜(Let's Encrypt 등)을 통해 보안 인증서를 자동 관리합니다.

## 4. 데이터베이스 및 메시징

* **Database**: 표준 PostgreSQL 프로토콜을 사용하며, 클러스터 내부의 **CloudNativePG** 또는 외부 독립형 DB 서버와 연동 가능하게 설계합니다.
* **Messaging**: **RabbitMQ** 또는 **Redis**를 모듈화하여 인프라 독립성을 확보합니다.

## 5. 오브젝트 스토리지

* **S3-compatible API**: 표준 S3 API 규격을 지원하는 모든 오브젝트 스토리지(오픈소스 MinIO 포함)와 호환됩니다.

## 6. 보안 및 시크릿 관리

* **HashiCorp Vault / K8s Secrets**: 표준 보안 관리 솔루션을 사용하여 환경 변수와 인증 정보를 독립적으로 관리합니다.
