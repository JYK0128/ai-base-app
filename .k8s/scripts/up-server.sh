#!/bin/bash

# 통합 서버 병렬 빌드 및 배포 스크립트 (Docker Desktop Kubernetes 버전)
set -Eeuo pipefail

dump_rollout_debug() {
    local dep="$1"
    local ns="$2"
    local selector="$3"

    echo "   [DEBUG] Rollout failed. Collecting diagnostic details..."
    echo "   [DEBUG] Deployment status:"
    kubectl describe "deployment/$dep" -n "$ns" || true

    echo "   [DEBUG] Pods:"
    kubectl get pods -n "$ns" -l "$selector" -o wide || true

    echo "   [DEBUG] Recent events:"
    kubectl get events -n "$ns" --sort-by=.lastTimestamp | tail -n 30 || true

    echo "   [DEBUG] Pod logs:"
    local pods
    pods=$(kubectl get pods -n "$ns" -l "$selector" -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || true)
    for pod in $pods; do
        echo "   [DEBUG] Logs for $pod"
        kubectl logs -n "$ns" "$pod" --tail=120 --previous || true
        kubectl logs -n "$ns" "$pod" --tail=120 || true
    done
}

echo "=================================================="
echo "🚀 [PIPELINE] SERVER BUILD & DEPLOYMENT"
echo "=================================================="

# 1단계: Docker 환경 설정 (Docker Desktop 연동)
CURRENT_DOCKER_CTX=$(docker context show)
echo "🐳 Step 1: Using active Docker context: $CURRENT_DOCKER_CTX"

# 2단계: 이미지 빌드
echo "📦 Step 2: Building Docker image..."
TARGET=${1:-service}

mkdir -p .k8s/logs

case "$TARGET" in
    service|platform-service)
        name="platform-service"
        df="apps/platform-service/Dockerfile"
        ;;
    *)
        echo "   ❌ [ERROR] Unsupported target: $TARGET"
        echo "   ✅ Available targets: service"
        exit 1
        ;;
esac

echo "   [BUILD] $name..."
if ! DOCKER_BUILDKIT=1 docker build -t "$name:latest" -f "$df" . > ".k8s/logs/build-${name}.log" 2>&1; then
    echo "   ❌ [ERROR] Docker build failed. Showing build log tail:"
    tail -n 120 ".k8s/logs/build-${name}.log" || true
    exit 1
fi
echo "   ✅ [SUCCESS] Built $name"

# 3단계: 매니페스트 적용 및 재시작
echo "⎈ Step 3: Applying manifests and restarting services..."
kubectl apply -k .k8s/overlays/dev

dep="platform-service-deploy"
ns="dev-service"
echo "   [RESTART] $dep..."
kubectl rollout restart "deployment/$dep" -n "$ns"
echo "   [WAIT-READY] Waiting for $dep rollout to complete..."
if ! kubectl rollout status "deployment/$dep" -n "$ns"; then
    dump_rollout_debug "$dep" "$ns" "app.kubernetes.io/name=platform-service"
    exit 1
fi
echo "   ✅ Service restarted and fully ready."

echo "=================================================="
echo "✅ Server Pipeline Completed Successfully!"
echo "=================================================="
