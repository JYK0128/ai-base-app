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

#### 0. Curl (다운로드 도구)

```bash
# Windows
# 최신 Windows 10/11에는 기본적으로 포함되어 있습니다.
# 만약 동작하지 않는다면: choco install curl

# MacOS (Homebrew)
brew install curl
```

#### 1. Helm (패키지 매니저)

인프라 엔진 설치를 위해 Helm 3 이상의 버전이 필요합니다.

- **공식 설치 가이드**: [Helm Installation Guide](https://helm.sh/docs/intro/install/)

#### 2. Telepresence (로컬 개발 환경 연결)

서비스 가로채기(Intercept) 및 로컬 디버깅을 위해 설치가 필요합니다.

- **공식 설치 가이드**: [Telepresence Installation Guide](https://telepresence.io/docs/install/client/)

### Step 1: 인프라 확장 설치 (Infrastructure Extensions)

오퍼레이터 및 서비스 메쉬 등 기반 엔진을 Helm을 통해 설치합니다.

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
