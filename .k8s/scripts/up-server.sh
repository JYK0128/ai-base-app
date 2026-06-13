#!/bin/bash

# 통합 서버 병렬 빌드 및 배포 스크립트 (Docker Desktop Kubernetes 버전)
set -e

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
DOCKER_BUILDKIT=1 docker build -t "$name:latest" -f "$df" . > ".k8s/logs/build-${name}.log" 2>&1
echo "   ✅ [SUCCESS] Built $name"

# 3단계: 매니페스트 적용 및 재시작
echo "⎈ Step 3: Applying manifests and restarting services..."
kubectl apply -k .k8s/overlays/dev

dep="platform-service-deploy"
ns="dev-service"
echo "   [RESTART] $dep..."
kubectl rollout restart "deployment/$dep" -n "$ns"
echo "   [WAIT-READY] Waiting for $dep rollout to complete..."
kubectl rollout status "deployment/$dep" -n "$ns"
echo "   ✅ Service restarted and fully ready."

echo "=================================================="
echo "✅ Server Pipeline Completed Successfully!"
echo "=================================================="
