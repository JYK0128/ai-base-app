# Kubernetes (K8s) 인프라 설계서 (Cloud-Agnostic MVP)

## 1. 아키텍처 개요

특정 클라우드 사업자(AWS, GCP, Azure 등)에 종속되지 않고 어디서나 구동 가능한 표준 Kubernetes 환경을 구축합니다.

## 2. 배포 구조 (Standard K8s)

* **Namespace**: `Marketplace` 단일 네임스페이스 사용.
* **Nodes**: 클라우드 사업자별 표준 VM(예: t3.medium 또는 n2-standard-2) 기반의 노드 그룹 사용.

## 3. 로드배런싱 및 인트레스 (Ingress)

* **Nginx Ingress Controller**: 사업자 전용 로드밸런서 대신 표준 Nginx Ingress를 사용하여 트래픽을 각 마이크로서비스로 라우팅합니다.
* **Cert-Manager**: Let's Encrypt 등을 통해 SSL/TLS 인증서를 자동 발급 및 갱신합니다.

## 4. 데이터베이스 및 메시징

* **Database**: 표준 PostgreSQL 프로토콜을 준수하며, 필요 시 K8s 내부에서 **CloudNativePG** 등을 통해 직접 운영하거나 사업자별 관리형 DB를 선택적으로 사용합니다.
* **Messaging**: **RabbitMQ** 또는 **Redis**를 K8s 클러스터 내부에 스테이트풀셋(StatefulSet)으로 구성하여 인프라 독립성을 확보합니다.

## 5. 오브젝트 스토리지

* **S3-compatible API**: AWS S3 뿐만 아니라 MinIO, Google Cloud Storage 등 S3 표준 API를 지원하는 모든 스토리지와 호환되도록 설계합니다.

## 6. 보안 및 시크릿 관리

* **HashiCorp Vault / K8s Secrets**: 클라우드 전용 시크릿 매니저 대신 표준 Vault 또는 K8s 내장 시크릿 기능을 사용하여 보안 정보를 관리합니다.
