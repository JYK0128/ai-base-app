#!/bin/bash

# 통합 서버 병렬 빌드 및 배포 스크립트 (Colima Kubernetes 버전)
set -e

echo "=================================================="
echo "🚀 [PIPELINE] SERVER BUILD & DEPLOYMENT (COLIMA)"
echo "=================================================="

# 1단계: Docker 환경 설정 (Colima 컨텍스트가 존재하면 사용)
if docker context inspect colima &> /dev/null; then
    echo "🐳 Step 1: Using Colima's Docker context..."
    docker context use colima
else
    echo "🐳 Step 1: Using default/native Docker context..."
fi

# 2단계: 이미지 병렬 빌드
echo "📦 Step 2: Building Docker images in parallel..."
APPS=${@:-"auth gateway core"}
build_pids=()
apps_array=($APPS)

mkdir -p .k8s/logs

for app in $APPS; do
    case "$app" in
        auth) name="platform-auth-service"; df="apps/platform-auth-service/Dockerfile" ;;
        gateway) name="platform-gateway"; df="apps/platform-gateway/Dockerfile" ;;
        core) name="platform-core-service"; df="apps/platform-core-service/Dockerfile" ;;
        *) continue ;;
    esac

    echo "   [BUILD] $name..."
    DOCKER_BUILDKIT=1 docker build -t "$name:latest" -f "$df" . > ".k8s/logs/build-${app}.log" 2>&1 &
    build_pids+=($!)
done

if [ ${#build_pids[@]} -gt 0 ]; then
    failed=0
    for i in "${!build_pids[@]}"; do
        pid="${build_pids[$i]}"
        app="${apps_array[$i]}"
        case "$app" in
            auth) name="platform-auth-service" ;;
            gateway) name="platform-gateway" ;;
            core) name="platform-core-service" ;;
        esac
        
        if ! wait "$pid"; then
            echo "   ❌ [ERROR] Build failed for $name. See log below:"
            echo "--------------------------------------------------"
            cat ".k8s/logs/build-${app}.log"
            echo "--------------------------------------------------"
            failed=1
        else
            echo "   ✅ [SUCCESS] Built $name"
        fi
    done
    
    if [ "$failed" -ne 0 ]; then
        echo "❌ Some Docker builds failed. Aborting deployment."
        exit 1
    fi
    echo "   ✅ All images built successfully inside Colima."
fi

# 3단계: 매니페스트 적용 및 병렬 재시작
echo "⎈ Step 3: Applying manifests and restarting services..."
kubectl apply -k .k8s/overlays/dev

restart_pids=()
for app in $APPS; do
    case "$app" in
        auth) ns="dev-service"; dep="platform-auth-service-deploy" ;;
        gateway) ns="dev-web"; dep="platform-gateway-deploy" ;;
        core) ns="dev-service"; dep="platform-core-service-deploy" ;;
        *) continue ;;
    esac
    echo "   [RESTART] $dep..."
    kubectl rollout restart "deployment/$dep" -n "$ns" &
    restart_pids+=($!)
done

if [ ${#restart_pids[@]} -gt 0 ]; then
    wait "${restart_pids[@]}"
    echo "   ✅ All services restarted."
fi

echo "=================================================="
echo "✅ Server Pipeline Completed Successfully!"
echo "=================================================="
