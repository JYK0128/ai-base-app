#!/bin/bash

# Script to build application Docker images for the monorepo
# This script should be run from the project root.

set -e

echo "Building platform-auth-service..."
docker build -t platform-auth-service:latest -f apps/platform-auth-service/Dockerfile .

echo "Building service-gateway..."
docker build -t service-gateway:latest -f apps/service-gateway/Dockerfile .

echo ""
echo "All images built successfully!"
echo "If you are using Docker Desktop, these images are now available to your local Kubernetes cluster."
echo "If you are using Minikube, remember to run 'eval \$(minikube docker-env)' before building, or use 'minikube image load <image_name>'."
