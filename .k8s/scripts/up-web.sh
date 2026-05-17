#!/bin/bash

# 통합 웹 빌드 및 배포 스크립트 (Colima Kubernetes 버전)
set -e

echo "=================================================="
echo "🚀 [PIPELINE] WEB BUILD & DEPLOYMENT (COLIMA)"
echo "=================================================="

# 1단계: Docker 환경 설정 (Colima 컨텍스트가 존재하면 사용)
if docker context inspect colima &> /dev/null; then
    echo "🐳 Step 1: Using Colima's Docker context..."
    docker context use colima
else
    echo "🐳 Step 1: Using default/native Docker context..."
fi

# 2단계: 이미지 빌드
echo "📦 Step 2: Building Web Docker image..."
DOCKER_BUILDKIT=1 docker build -t "platform-admin-web:latest" -f "web/platform-admin-web/Dockerfile" .

# 3단계: 매니페스트 적용 및 재시작
echo "⎈ Step 3: Applying manifests and restarting web..."
kubectl apply -k .k8s/overlays/dev
kubectl rollout restart deployment/platform-admin-web-deploy -n dev-web

echo "=================================================="
echo "✅ Web Pipeline Completed Successfully!"
echo "=================================================="
