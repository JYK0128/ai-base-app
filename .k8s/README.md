# Kubernetes Infrastructure Installation Guide

본 디렉토리(`.k8s`)는 프로젝트의 모든 쿠버네티스 매니페스트를 관리하며, 아래 절차에 따라 인프라를 설치함.

## 0. 필수 선수 조건 (Prerequisites)

- Kubernetes Cluster (Docker Desktop, Minikube, EKS 등)
- `kubectl` CLI 및 `kustomize` (kubectl v1.21+ 내장)
- `helm` (일부 오퍼레이터 설치용)

## 1. 필수 확장 프로그램(Extensions) 설치 (Helm)

인프라 엔진(Operators)은 Helm을 통해 설치하고 버전을 관리합니다. 아래 명령어로 필요한 확장을 모두 설치합니다.

```bash
# Helm 레포지토리 등록
helm repo add cnpg https://cloudnative-pg.github.io/charts
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add strimzi https://strimzi.io/charts/
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update

# 오퍼레이터 및 서비스 메시(Extensions) 설치
# 1. Istio (Service Mesh Engine)
helm upgrade --install istio-base istio/base -n istio-system --create-namespace --wait
helm upgrade --install istiod istio/istiod -n istio-system --wait
helm upgrade --install istio-ingress istio/gateway -n istio-system --wait

# 2. Database & Messaging Operators
helm upgrade --install cnpg cnpg/cloudnative-pg -n cnpg-system --create-namespace
helm upgrade --install rabbitmq-operator bitnami/rabbitmq-cluster-operator -n rabbitmq-system --create-namespace
helm upgrade --install strimzi strimzi/strimzi-kafka-operator -n dev-infra --create-namespace
helm upgrade --install redis-operator ot-container-kit/redis-operator -n redis-operator --create-namespace
```

## 2. 표준 배포 순서 (Standard Deployment Sequence)

오퍼레이터가 `Running` 상태임을 확인한 후 아래 명령어를 실행함.

### Phase 1: 기반 시설 (Base)

```bash
# 네임스페이스 및 네트워크 정책
kubectl apply -k .k8s/namespaces
kubectl apply -k .k8s/network-policies
```

### Phase 2: 데이터 및 메시징 (Data & Messaging)

```bash
# 개별 설치 (의존성 확인 필요)
kubectl apply -k .k8s/database/postgres
kubectl apply -k .k8s/database/redis
kubectl apply -k .k8s/messaging/rabbitmq
kubectl apply -k .k8s/messaging/kafka
```

### Phase 3: 애플리케이션 및 모니터링 (Apps & Monitoring)

```bash
# 개발 환경(dev) 오버레이 전체 적용 (추천)
kubectl apply -k .k8s/overlays/dev
```

---
*최종 업데이트: 2026-04-13*
