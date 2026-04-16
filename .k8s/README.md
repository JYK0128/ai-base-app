# Kubernetes Infrastructure Guide 🚀

본 디렉토리(`.k8s`)는 프로젝트의 모든 쿠버네티스 인프라 자원 및 배포 명세를 관리합니다.  
**Helm**(인프라 엔진 설치)과 **Kustomize**(애플리케이션 및 설정 관리)를 결합한 하이브리드 모델을 따릅니다.

---

## 📂 Directory Structure

```text
.k8s/
├── scripts/             # 인프라 설치 및 관리 스크립트 (Helm 중심)
├── namespaces/          # 클러스터 네임스페이스 선언
├── network-policies/    # 보안 정책 (Zero-Trust 기반)
├── apps/                # 비즈니스 서비스 명세 (ConfigMap, Deployment, Svc)
├── database/            # 상태 저장소 명세 (Postgres, Redis)
├── messaging/           # 메시지 브로커 명세 (RabbitMQ, Kafka)
├── monitoring/          # 관측성 도구 (Loki, Mimir, Tempo, Grafana)
├── networking/          # 서비스 메쉬 및 인그레스 설정 (Istio)
└── overlays/            # 환경별(dev, prod) 통합 배포 설정
```

---

## 🛠️ Installation Steps

### Step 0: 사전 필수 도구 설치 (Prerequisites)

인프라 구축 및 개발을 위해 아래 도구들이 로컬 PC에 설치되어 있어야 합니다.

#### 1. Helm (패키지 매니저)

인프라 엔진 설치를 위해 Helm 3 이상의 버전이 필요합니다.

- **공식 설치 가이드**: [Helm Installation Guide](https://helm.sh/docs/intro/install/)

#### 2. Telepresence (로컬 개발 환경 연결)

서비스 가로채기(Intercept) 및 로컬 디버깅을 위해 설치가 필요합니다.

- **공식 설치 가이드**: [Telepresence Installation Guide](https://telepresence.io/docs/install/client/)

### Step 1: 인프라 확장 설치 (Infrastructure Extensions)

오퍼레이터 및 서비스 메쉬 등 기반 엔진을 Helm을 통해 설치합니다. (이 과정을 누락하면 애플리케이션 배포 시 CRD를 찾을 수 없다는 에러가 발생합니다.)

제공된 스크립트를 사용하여 필수 오퍼레이터(Istio, DB, 메시징 큐 등)를 일괄 설치할 수 있습니다:

```bash
# 프로젝트 루트 디렉토리에서 실행 (Git Bash 또는 Linux/WSL 환경)
bash .k8s/scripts/setup-infra.sh
```

### Step 1.5: 애플리케이션 빌드 (선택)

로컬 개발 환경에서는 배포 전 파드에서 사용할 애플리케이션 도커 이미지를 빌드해야 합니다.

```bash
# 프로젝트 루트 디렉토리에서 전체 모노레포 앱 빌드
bash .k8s/scripts/build-apps.sh
```

### Step 2: 리소스 배포 (Kustomize)

엔진 설치가 완료되면, Kustomize 오버레이를 통해 환경별 리소스를 배포합니다.

```bash
# 개발 환경(dev) 전체 배포
kubectl apply -k .k8s/overlays/dev

# 운영 환경(prod) 전체 배포
kubectl apply -k .k8s/overlays/prod
```

### Telepresence 사용 가이드 (CLI)

로컬 환경에서 클러스터 내부 서비스에 접근하거나, 트래픽을 로컬로 가로채기 위해 사용합니다.

#### 1. 클러스터 연결

```bash
# 클러스터 연결 (기본)
telepresence connect

# 연결 상태 확인
telepresence status
```

#### 2. 서비스 가로채기 (Intercept)

개발 중인 로컬 서비스를 클러스터 내부의 특정 서비스 대신 동작하게 합니다.

```bash
# 구문: telepresence intercept [서비스명] --port [로컬포트]
# 예: order-service를 로컬 8080포트로 가로채기
telepresence intercept order-service --port 8080
```

#### 3. 연결 종료

```bash
# Telepresence 데몬 종료 및 연결 해제
telepresence quit
```

#### 4. Windows 자동 연결 설정

윈도우 시작 시 자동으로 연결되도록 설정하려면 다음 스크립트를 작업 스케줄러나 시작 프로그램에 등록하세요.

- **스크립트 경로**: `.k8s/scripts/windows-connect-telepresence.ps1`
- **실행 인수**: `powershell.exe -ExecutionPolicy Bypass -File "[절대경로]\.k8s\scripts\windows-connect-telepresence.ps1"`

---

## 📜 주요 정책 및 표준

1. **Naming Convention**: 모든 파일과 리소스는 `[기술명]-[리소스종류].yaml` 형식을 따릅니다.
    - 예: `mimir-cm.yaml`, `service-gateway-svc.yaml`
2. **Hybrid Management**:
    - **Helm**: 제어 계층(Operators, Istio) 설치에 사용.
    - **Kustomize**: 데이터 계층(Clusters, Instances), 애플리케이션 및 환경별 수정에 사용.
3. **Security**:
    - 모든 통신은 **NetworkPolicy**에 의해 기본 차단(Default Deny)됩니다.
    - 임시 작업물이나 스크립트는 반드시 **`.tmp/`** 폴더 내에서 생성 및 관리합니다.

---
*최종 업데이트: 2026-04-13*  
*관련 문서: [.agents/AGENTS.md](file:///c:/Users/surface/Documents/GitHub/ai-base-app/.agents/AGENTS.md), [.docs/05_references/](file:///c:/Users/surface/Documents/GitHub/ai-base-app/.docs/05_references/)*
