#!/bin/bash

# Kubernetes 로컬 개발 환경 및 인프라 통합 설치 스크립트 (Docker Desktop 전용)
set -e

# UI 출력을 위한 ANSI 컬러 코드 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${BLUE}==================================================${NC}"
echo -e "🚀  ${GREEN}KUBERNETES INFRASTRUCTURE INITIALIZATION (DOCKER DESKTOP)${NC}"
echo -e "${BLUE}==================================================${NC}"

# 1단계: 필수 CLI 도구 확인 및 선별 설치 (Docker Desktop 연동)
log_info "Step 1: Preparing CLI tools..."
OS="$(uname -s)"

if [[ "$OS" != "Darwin" ]]; then
    log_error "This script is optimized for macOS (Darwin) with Docker Desktop."
    exit 1
fi

# Docker Desktop 엔진 활성화 여부 사전 체크
if ! command -v docker &> /dev/null; then
    log_error "Docker Desktop is not installed or not in PATH."
    log_warn "Please install Docker Desktop first: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running. Please start Docker Desktop application."
    exit 1
fi
log_success "Docker Desktop daemon is active."

# CLI 도구 검증 및 설치
install_tools() {
    # docker는 Docker Desktop 제공 바이너리를 권장하므로 검증만 수행
    if ! command -v docker &> /dev/null; then
        log_error "Required tool 'docker' is not available. Please ensure Docker Desktop is fully installed."
        exit 1
    fi

    # docker-buildx 플러그인 작동 여부 검증
    if ! docker buildx version &> /dev/null; then
        log_error "Docker Buildx plugin is not active. Please ensure Docker Desktop is fully installed."
        exit 1
    fi
    log_success "'docker' and 'docker-buildx' are available."

    # K8s 관리 도구는 brew를 통해 설치 가능
    local k8s_tools=("kubectl" "helm" "telepresence")
    for tool in "${k8s_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_warn "'$tool' not found. Installing via Homebrew..."
            if [[ "$tool" == "telepresence" ]]; then
                brew install telepresenceio/telepresence/telepresence-oss
            else
                brew install "$tool"
            fi
        else
            log_success "'$tool' is already installed."
        fi
    done
}
install_tools

# 2단계: Kubernetes 로컬 환경 검증 및 컨텍스트 변경
log_info "Step 2: Checking Kubernetes Cluster context..."

# 1. K8s context를 docker-desktop으로 강제 지정
TARGET_CONTEXT="docker-desktop"

if ! kubectl config get-contexts -o name | grep -q "^${TARGET_CONTEXT}$"; then
    log_error "Kubernetes context '${TARGET_CONTEXT}' not found."
    log_warn "--------------------------------------------------"
    log_warn "Docker Desktop의 Kubernetes 설정이 활성화되어 있지 않습니다."
    log_warn "1. Docker Desktop 앱을 실행합니다."
    log_warn "2. Settings (톱니바퀴 아이콘) -> Kubernetes 메뉴로 이동합니다."
    log_warn "3. 'Enable Kubernetes' 체크박스를 선택하고 'Apply & restart'를 누릅니다."
    log_warn "4. 완료 후 이 스크립트를 다시 실행해주세요."
    log_warn "--------------------------------------------------"
    exit 1
fi

# 컨텍스트 전환
kubectl config use-context "$TARGET_CONTEXT"
log_success "Switched to Kubernetes context: ${TARGET_CONTEXT}"

# API 서버 응답성 확인 (실제 기동 완료 여부 검증)
log_info "Waiting for Kubernetes API Server to respond..."
until kubectl cluster-info &> /dev/null; do
    log_warn "Kubernetes cluster is starting up, retrying in 5 seconds..."
    sleep 5
done
log_success "Kubernetes Cluster is healthy and ready!"

# 3단계: 인프라 서비스 설치 (Helm)
log_info "Step 3: Installing infrastructure operators (Helm)..."

# Helm 리포지토리 추가 및 업데이트
log_info "Updating Helm Repositories..."
helm repo add cnpg https://cloudnative-pg.github.io/charts
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo add ot-container-kit https://ot-container-kit.github.io/helm-charts
helm repo update

# 1. Istio 설치 (네트워크 메쉬 및 Ingress)
log_info "Deploying Istio Service Mesh..."
helm upgrade --install istio-base istio/base -n istio-system --create-namespace --wait
helm upgrade --install istiod istio/istiod -n istio-system --wait
log_success "Istio Operator successfully deployed."

# 2. CloudNative-PG 설치 (PostgreSQL Operator)
log_info "Deploying PostgreSQL Operator (CloudNative-PG)..."
helm upgrade --install cnpg cnpg/cloudnative-pg -n cnpg-system --create-namespace --wait
log_success "CNPG Operator successfully deployed."

# 3. RabbitMQ Cluster Operator 설치
log_info "Deploying RabbitMQ Cluster Operator..."
# 최신 정적 YAML 다운로드/적용 시의 네트워크 불안정성 대비 및 버전 명시화
RABBITMQ_VERSION="v2.12.0" # 고정된 안정 버전을 지정
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/download/${RABBITMQ_VERSION}/cluster-operator.yml"
log_success "RabbitMQ Operator successfully deployed."

# 4. Redis Operator 설치
log_info "Deploying Redis Operator..."
helm upgrade --install redis-operator ot-container-kit/redis-operator -n redis-operator --create-namespace --wait
log_success "Redis Operator successfully deployed."

# 5. Telepresence OSS 설치
log_info "Deploying Telepresence OSS Traffic Manager..."
helm upgrade --install traffic-manager oci://ghcr.io/telepresenceio/telepresence-oss --namespace ambassador --create-namespace --wait
log_success "Telepresence OSS Traffic Manager successfully deployed."

echo -e "${BLUE}==================================================${NC}"
echo -e "🎉  ${GREEN}Kubernetes Infrastructure Initialized Successfully!${NC}"
echo -e "${BLUE}==================================================${NC}"
