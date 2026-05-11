#!/bin/bash

# Apply the dev Kubernetes manifests and restart app deployments so local
# :latest images are picked up after a rebuild.

set -e

ALL_APPS=("auth" "core" "gateway" "admin")

normalize_selection() {
    local item
    for item in "$@"; do
        case "$item" in
            1)
                echo "auth"
                ;;
            2)
                echo "gateway"
                ;;
            3)
                echo "core"
                ;;
            4)
                echo "admin"
                ;;
            *)
                echo "$item"
                ;;
        esac
    done
}

resolve_deployment() {
    case "$1" in
        auth|platform-auth-service)
            echo "dev-api platform-auth-service-deploy"
            ;;
        core|platform-core-service)
            echo "dev-api platform-core-service-deploy"
            ;;
        gateway|platform-gateway)
            echo "dev-web platform-gateway-deploy"
            ;;
        admin|web|platform-admin-web)
            echo "dev-web platform-admin-web-deploy"
            ;;
        *)
            echo ""
            ;;
    esac
}

selected_apps=()
if [[ "$#" -eq 0 ]]; then
    echo "Select apps to deploy:"
    echo "  1) auth    (platform-auth-service)"
    echo "  2) gateway (platform-gateway)"
    echo "  3) core    (platform-core-service)"
    echo "  4) admin   (platform-admin-web)"
    echo ""
    read -p "Enter numbers or names separated by spaces/commas. Press [Enter] for all: " -r selection
    echo ""

    if [[ -z "$selection" || "$selection" == "all" ]]; then
        selected_apps=("${ALL_APPS[@]}")
    else
        normalized_selection="${selection//,/ }"
        mapfile -t selected_apps < <(normalize_selection $normalized_selection)
    fi
else
    if [[ "$#" -eq 1 && "$1" == "all" ]]; then
        selected_apps=("${ALL_APPS[@]}")
    else
        mapfile -t selected_apps < <(normalize_selection "$@")
    fi
fi

selected_deployments=()
for app in "${selected_apps[@]}"; do
    deployment="$(resolve_deployment "$app")"
    if [[ -z "$deployment" ]]; then
        echo "❌ Unknown app: ${app}"
        echo "Available apps: all, auth, gateway, core, admin"
        exit 1
    fi
    selected_deployments+=("$deployment")
done

echo "--------------------------------------------------"
echo "🚀 Deploying application manifests..."
echo "--------------------------------------------------"
echo "Targets: ${selected_apps[*]}"
echo ""

kubectl apply -k .k8s/overlays/dev

echo ""
echo "🔄 Restarting application deployments..."

for target in "${selected_deployments[@]}"; do
    read -r namespace deployment <<< "$target"
    kubectl rollout restart "deployment/${deployment}" -n "$namespace"
done

echo ""
echo "⏳ Waiting for rollouts..."

for target in "${selected_deployments[@]}"; do
    read -r namespace deployment <<< "$target"
    kubectl rollout status "deployment/${deployment}" -n "$namespace" --timeout=180s
done

echo ""
echo "✅ Deployment complete."
echo "--------------------------------------------------"
