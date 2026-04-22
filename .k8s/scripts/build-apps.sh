#!/bin/bash

# Script to build application Docker images for the monorepo
# This script should be run from the project root.

set -e

echo "--------------------------------------------------"
echo "🚀 Building application Docker images..."
echo "--------------------------------------------------"

# Build platform-auth-service
echo "📦 Building platform-auth-service..."
docker build -t platform-auth-service:latest -f apps/platform-auth-service/Dockerfile .

# Build platform-gateway
echo "📦 Building platform-gateway..."
docker build -t platform-gateway:latest -f apps/platform-gateway/Dockerfile .

echo ""
echo "✅ All images built successfully!"
echo "--------------------------------------------------"

# Optional deployment
read -p "❓ Do you want to deploy these images to Kubernetes now? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 Deploying to Kubernetes..."
    kubectl apply -k .k8s/apps
    echo "✅ Deployment commands sent!"
    echo "Check status with: kubectl get pods -n dev-api"
else
    echo "⏭️ Skipping deployment."
    echo "If you are using Docker Desktop, these images are now available to your local Kubernetes cluster."
    echo "If you are using Minikube, remember to run 'eval \$(minikube docker-env)' before building, or use 'minikube image load <image_name>'."
fi

echo ""
read -p "Press [Enter] to exit..."
