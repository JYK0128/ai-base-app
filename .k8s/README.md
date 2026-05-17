# Kubernetes Infrastructure Guide 🚀

본 디렉토리(`.k8s`)는 프로젝트의 모든 쿠버네티스 인프라 자원 및 배포 명세를 관리합니다.  
**Helm**(인프라 엔진 설치)과 **Kustomize**(애플리케이션 및 설정 관리)를 결합한 하이브리드 모델을 따릅니다.

---

## 📂 Directory Structure

```text
.k8s/
├── scripts/             # 인프라 설치 및 관리 스크립트 (Helm 중심)
├── namespaces/          # 클러스터 네임스페이스 선언
├── networking/          # 보안 정책 (Zero-Trust NetworkPolicy) 및 인그레스/이그레스
├── apps/                # 비즈니스 서비스 명세 (ConfigMap, Secret, Deployment, Svc)
├── database/            # 상태 저장소 명세 (Postgres, Redis)
├── messaging/           # 메시지 브로커 명세 (RabbitMQ)
├── monitoring/          # 관측성 도구 (Loki, Mimir, Tempo, Grafana, Alloy)
└── overlays/            # 환경별(dev, prod) 통합 배포 설정
```

---

## 🛠️ Installation Steps

### Step 0: 사전 필수 도구 설치 (Prerequisites)

인프라 구축 및 개발을 위해 아래 도구들이 로컬 PC에 설치되어 있어야 합니다.

#### 1. Helm (패키지 매니저)

인프라 엔진 설치를 위해 Helm 3 이상의 버전이 필요합니다.

- **공식 설치 가이드**: [Helm Installation Guide](https://helm.sh/docs/intro/install/)

#### 2. Minikube (로컬 Kubernetes 클러스터)

로컬 개발 환경에서 Kubernetes 클러스터를 실행합니다.

- **공식 설치 가이드**: [Minikube Installation Guide](https://minikube.sigs.k8s.io/docs/start/)

### Step 1: 인프라 확장 설치 (Infrastructure Extensions)

오퍼레이터 및 서비스 메쉬 등 기반 엔진을 Helm을 통해 설치합니다. (이 과정을 누락하면 애플리케이션 배포 시 CRD를 찾을 수 없다는 에러가 발생합니다.)

제공된 스크립트를 사용하여 필수 오퍼레이터(Istio, DB, 메시징 큐 등)를 일괄 설치할 수 있습니다:

```bash
# 프로젝트 루트 디렉토리에서 실행
bash .k8s/scripts/setup-infra.sh
```

### Step 1.5: 애플리케이션 빌드

로컬 개발 환경에서는 배포 전 파드에서 사용할 애플리케이션 도커 이미지를 빌드해야 합니다.

```bash
# 서버 앱 빌드 및 배포
bash .k8s/scripts/up-server.sh

# 웹 앱 빌드 및 배포
bash .k8s/scripts/up-web.sh
```

### Step 2: 리소스 배포 (Kustomize)

엔진 설치가 완료되면, Kustomize 오버레이를 통해 환경별 리소스를 배포합니다.

```bash
# 개발 환경(dev) 전체 배포
kubectl apply -k .k8s/overlays/dev

# 운영 환경(prod) 전체 배포
kubectl apply -k .k8s/overlays/prod
```

---

## 📜 주요 정책 및 표준

1. **Naming Convention**:
    - **리소스 파일**: `[서비스명]-[리소스종류].yaml`
      - 예: `mimir-cm.yaml`, `platform-gateway-svc.yaml`, `postgres-backup-pvc.yaml`
    - **NetworkPolicy 파일**: `[direction]-[source]-[preposition]-[target].yaml`
      - 예: `egress-platform-gateway-to-infra.yaml`, `ingress-redis-from-platform-services.yaml`
    - 리소스 이름에 환경명(`dev-`, `prod-`)을 포함하지 않습니다. 환경 분리는 namespace로 처리합니다.
2. **Hybrid Management**:
    - **Helm**: 제어 계층(Operators, Istio) 설치에 사용.
    - **Kustomize**: 데이터 계층(Clusters, Instances), 애플리케이션 및 환경별 수정에 사용.
3. **Security**:
    - 모든 통신은 **NetworkPolicy**에 의해 기본 차단(Default Deny)됩니다.
    - 민감한 자격증명은 반드시 **Secret** 리소스로 관리하며, ConfigMap에는 포함하지 않습니다.
    - 임시 작업물이나 스크립트는 반드시 **`.tmp/`** 폴더 내에서 생성 및 관리합니다.

---
*최종 업데이트: 2026-05-17*
