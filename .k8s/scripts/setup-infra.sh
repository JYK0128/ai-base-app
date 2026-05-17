#!/bin/bash

# Kubernetes 로컬 개발 환경 및 인프라 통합 설치 스크립트
# Colima (기본 선호) 또는 Minikube 지원, 기존 Kubernetes 컨텍스트도 유연하게 지원
set -e

echo "=================================================="
echo "🚀 [INFRA] KUBERNETES INITIALIZATION"
echo "=================================================="

# 1단계: 필수 CLI 도구 확인 및 설치 (macOS 전용)
echo "📦 Step 1: Preparing CLI tools..."
OS="$(uname -s)"
install_tools() {
    if [[ "$OS" == "Darwin" ]]; then
        # colima가 있으면 minikube보다 우선 설치 및 사용합니다.
        local tools=("kubectl" "helm" "colima" "docker" "docker-buildx")
        for tool in "${tools[@]}"; do
            local binary_name=$(echo "$tool" | awk -F/ '{print $NF}')
            if ! command -v "$binary_name" &> /dev/null; then
                echo "   - Installing $tool..."
                brew install "$tool"
            fi
        done

        # docker-buildx 플러그인 심볼릭 링크 설정
        mkdir -p "$HOME/.docker/cli-plugins"
        if [ ! -L "$HOME/.docker/cli-plugins/docker-buildx" ]; then
            echo "   - Linking docker-buildx plugin..."
            ln -sfn "$(brew --prefix)/opt/docker-buildx/bin/docker-buildx" "$HOME/.docker/cli-plugins/docker-buildx"
        fi
    fi
}
install_tools

# 2단계: 로컬 Kubernetes 환경 준비 (Colima / Minikube 감지)
echo "🐳 Step 2: Starting local Kubernetes..."
if [[ "$OS" == "Darwin" ]] && command -v colima &> /dev/null; then
    # 1순위: Colima 지원
    if ! colima status &> /dev/null; then
        echo "   - Starting Colima with CPUs=4, Memory=8GB..."
        colima start --kubernetes --cpu 4 --memory 8
    else
        echo "   ✅ Colima is already running."
    fi

    # Kubernetes 컨텍스트를 colima로 설정
    if kubectl config get-contexts -o name | grep -q "^colima$"; then
        kubectl config use-context colima
        echo "   ✅ Switched to Colima Kubernetes context."
    fi
elif [[ "$OS" == "Darwin" ]] && command -v minikube &> /dev/null; then
    # 2순위: Minikube 지원
    if ! minikube status &> /dev/null; then
        echo "   - Starting Minikube with CPUs=4, Memory=8192MB..."
        minikube start --driver=docker --cpus=4 --memory=8192
    else
        echo "   ✅ Minikube is already running."
    fi

    # Kubernetes 컨텍스트를 minikube로 설정
    if kubectl config get-contexts -o name | grep -q "^minikube$"; then
        kubectl config use-context minikube
        echo "   ✅ Switched to Minikube Kubernetes context."
    fi

    # Minikube Docker 환경 설정
    echo "   - Configuring Docker to use Minikube's daemon..."
    eval $(minikube docker-env)
else
    # 3순위: 기타 활성 컨텍스트 사용
    echo "   - Skipping local VM startup (Colima/Minikube not running or not supported)."
    CURRENT_CTX=$(kubectl config current-context 2>/dev/null || true)
    echo "   ✅ Using current active Kubernetes context: ${CURRENT_CTX:-'default'}"
fi

# 3단계: 인프라 서비스 설치 (Helm)
echo "🌐 Step 3: Installing infrastructure operators (Helm)..."

helm repo add cnpg https://cloudnative-pg.github.io/charts
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo add ot-container-kit https://ot-container-kit.github.io/helm-charts
helm repo update

echo "   - Installing Istio..."
helm upgrade --install istio-base istio/base -n istio-system --create-namespace --wait
helm upgrade --install istiod istio/istiod -n istio-system --wait

echo "   - Installing Operators..."
helm upgrade --install cnpg cnpg/cloudnative-pg -n cnpg-system --create-namespace --wait
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
helm upgrade --install redis-operator ot-container-kit/redis-operator -n redis-operator --create-namespace --wait

echo "=================================================="
echo "✅ Kubernetes Infrastructure Initialized!"
echo "=================================================="
