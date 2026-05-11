#!/bin/bash

# Script to build application Docker images for the monorepo
# This script should be run from the project root.

set -e

LOG_DIR=".k8s/build-logs"

echo "--------------------------------------------------"
echo "🚀 Building application Docker images..."
echo "--------------------------------------------------"
echo "Logs: ${LOG_DIR}"
echo ""

export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"
mkdir -p "${LOG_DIR}"

ALL_APPS=("auth" "gateway" "core" "admin")

resolve_image_name() {
    case "$1" in
        auth|platform-auth-service)
            echo "platform-auth-service"
            ;;
        gateway|platform-gateway)
            echo "platform-gateway"
            ;;
        core|platform-core-service)
            echo "platform-core-service"
            ;;
        admin|web|platform-admin-web)
            echo "platform-admin-web"
            ;;
        *)
            echo ""
            ;;
    esac
}

resolve_dockerfile() {
    case "$1" in
        platform-auth-service)
            echo "apps/platform-auth-service/Dockerfile"
            ;;
        platform-gateway)
            echo "apps/platform-gateway/Dockerfile"
            ;;
        platform-core-service)
            echo "apps/platform-core-service/Dockerfile"
            ;;
        platform-admin-web)
            echo "web/platform-admin-web/Dockerfile"
            ;;
    esac
}

build_image() {
    local name="$1"
    local dockerfile="$2"
    local log_file="${LOG_DIR}/${name}.log"

    docker build --progress=plain -t "${name}:latest" -f "${dockerfile}" . >"${log_file}" 2>&1
}

print_result() {
    local name="$1"
    local log_file="${LOG_DIR}/${name}.log"
    local status="$2"

    if [[ "${status}" -eq 0 ]]; then
        echo "✅ ${name}"
    else
        echo "❌ ${name} (see ${log_file})"
    fi
}

wait_build() {
    local name="$1"
    local pid="$2"
    local status=0

    if wait "$pid"; then
        status=0
    else
        status=$?
    fi

    print_result "$name" "$status"
    return "$status"
}

selected_apps=()
if [[ "$#" -eq 0 ]]; then
    echo "Select images to build:"
    echo "  1) auth    (platform-auth-service)"
    echo "  2) gateway (platform-gateway)"
    echo "  3) core    (platform-core-service)"
    echo "  4) admin   (platform-admin-web)"
    echo ""
    read -p "Enter numbers or names separated by spaces/commas. Press [Enter] for all: " -r selection
    echo ""

    if [[ -z "$selection" ]]; then
        selected_apps=("${ALL_APPS[@]}")
    else
        normalized_selection="${selection//,/ }"
        for item in $normalized_selection; do
            case "$item" in
                1)
                    selected_apps+=("auth")
                    ;;
                2)
                    selected_apps+=("gateway")
                    ;;
                3)
                    selected_apps+=("core")
                    ;;
                4)
                    selected_apps+=("admin")
                    ;;
                *)
                    selected_apps+=("$item")
                    ;;
            esac
        done
    fi
else
    if [[ "$#" -eq 1 && "$1" == "all" ]]; then
        selected_apps=("${ALL_APPS[@]}")
    else
        selected_apps=("$@")
    fi
fi

selected_images=()
for app in "${selected_apps[@]}"; do
    image_name="$(resolve_image_name "$app")"
    if [[ -z "$image_name" ]]; then
        echo "❌ Unknown app: ${app}"
        echo "Available apps: auth, gateway, core, admin"
        exit 1
    fi
    selected_images+=("$image_name")
done

echo "📦 Starting parallel builds..."
echo "Targets: ${selected_images[*]}"
echo ""

pids=()
names=()
for image_name in "${selected_images[@]}"; do
    build_image "$image_name" "$(resolve_dockerfile "$image_name")" &
    pids+=("$!")
    names+=("$image_name")
done

failed=0

for i in "${!pids[@]}"; do
    wait_build "${names[$i]}" "${pids[$i]}" || failed=1
done

if [[ "$failed" -ne 0 ]]; then
    echo ""
    echo "❌ One or more image builds failed."
    echo "Open the log file shown above for full Docker output."
    exit 1
fi

echo ""
echo "✅ All images built successfully!"
echo "--------------------------------------------------"

# Optional deployment
REPLY=""
if [[ -t 0 ]]; then
    read -p "❓ Do you want to deploy these images to Kubernetes now? (y/N) " -n 1 -r || true
    echo ""
else
    echo "⏭️ Non-interactive shell detected. Skipping deployment prompt."
fi

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 Deploying to Kubernetes..."
    bash .k8s/scripts/deploy-apps.sh "${selected_apps[@]}"
else
    echo "⏭️ Skipping deployment."
    echo "If you are using Docker Desktop, these images are now available to your local Kubernetes cluster."
    echo "If you are using Minikube, remember to run 'eval \$(minikube docker-env)' before building, or use 'minikube image load <image_name>'."
fi
