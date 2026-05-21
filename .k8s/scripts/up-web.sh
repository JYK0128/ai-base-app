#!/bin/bash

# 통합 웹 빌드 및 배포 스크립트 (Docker Desktop Kubernetes 버전)
set -e

echo "=================================================="
echo "🚀 [PIPELINE] WEB BUILD & DEPLOYMENT"
echo "=================================================="

# 1단계: Docker 환경 설정 (Docker Desktop 연동)
CURRENT_DOCKER_CTX=$(docker context show)
echo "🐳 Step 1: Using active Docker context: $CURRENT_DOCKER_CTX"

# 2단계: 이미지 빌드
echo "📦 Step 2: Building Web Docker image..."
DOCKER_BUILDKIT=1 docker build -t "platform-admin-web:latest" -f "web/platform-admin-web/Dockerfile" .

# 3단계: 매니페스트 적용 및 재시작
echo "⎈ Step 3: Applying manifests and restarting web..."
kubectl apply -k .k8s/overlays/dev
kubectl rollout restart deployment/platform-admin-web-deploy -n dev-web
echo "   [WAIT-READY] Waiting for platform-admin-web-deploy rollout to complete..."
kubectl rollout status deployment/platform-admin-web-deploy -n dev-web

echo "=================================================="
echo "✅ Web Pipeline Completed Successfully!"
echo "=================================================="
