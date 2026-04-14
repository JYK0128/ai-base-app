#!/bin/bash

# Kubernetes Infrastructure Extensions Setup Script
# This script installs the necessary operators using Helm.

set -e

echo "Adding Helm repositories..."
helm repo add cnpg https://cloudnative-pg.github.io/charts
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add strimzi https://strimzi.io/charts/
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo add ot-container-kit https://ot-container-kit.github.io/helm-charts
helm repo update

echo "Installing Istio Service Mesh (Engine)..."
helm upgrade --install istio-base istio/base -n istio-system --create-namespace --wait
helm upgrade --install istiod istio/istiod -n istio-system --wait
helm upgrade --install istio-ingress istio/gateway -n istio-system --wait

echo "Installing CloudNativePG (Postgres Operator)..."
helm upgrade --install cnpg cnpg/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace \
  --wait

echo "Installing RabbitMQ Cluster Operator (Official)..."
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
kubectl wait --for=condition=available --timeout=300s deployment/rabbitmq-cluster-operator -n rabbitmq-system

echo "Installing Strimzi Kafka Operator..."
helm upgrade --install strimzi strimzi/strimzi-kafka-operator \
  --namespace dev-infra \
  --create-namespace \
  --wait

echo "Installing OpsTree Redis Operator..."
helm upgrade --install redis-operator ot-container-kit/redis-operator \
  --namespace redis-operator \
  --create-namespace \
  --wait

echo "Installing Telepresence Traffic Manager..."
telepresence helm install

echo "All extensions installed successfully!"
