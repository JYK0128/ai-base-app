---
name: k8s-infrastructure-guide
description: 쿠버네티스(K8s) 인프라 자원 명세 작성 및 수정 스킬. Helm/Kustomize 하이브리드 구조 준수, NetworkPolicy 및 Secret 보안 규칙 검증, 로컬 빌드/배포 스크립트 실행 제어. 인프라 설정 수정, ConfigMap/Secret 추가, 네트워크 정책 변경 시 필수 사용.
---

# 쿠버네티스 인프라 가이드 (Kubernetes Infrastructure Guide)

- 프로젝트의 모든 쿠버네티스 인프라 자원 및 배포 명세의 일관된 관리를 보장함
- 실제 파일 생성/수정, 영향 범위 확인, 타입체크/린트/빌드 검증 시 `coding-change-workflow` 스킬을 함께 적용함

---

## 📋 상세 가이드 목차 (Table of Contents)

세부 표준 및 구축 절차: 아래 참조 파일을 `view_file`로 열어 확인

| 섹션 | 설명 | 참조 파일 |
| --- | --- | --- |
| 🛡️ 1. 구조 및 네이밍 규칙 | Kustomize/Helm 하이브리드 구조 및 파일/리소스 명명 규칙 | `references/01_structure_and_naming.md` |
| 🔒 2. 네트워크 정책 및 보안 규칙 | Zero-Trust NetworkPolicy 설정 및 Secret 보안 정책 | `references/02_network_policy_and_security.md` |
| 🔄 3. 배포 및 검증 절차 | 로컬 빌드/배포 스크립트 실행 및 Kustomize 검증 프로세스 | `references/03_deployment_and_validation.md` |

---

## 🔄 워크플로우

1. **인프라 변경 대상 분석**:
   - 변경이 요구되는 대상 레이어(애플리케이션 서비스, 네트워크 보안, 모니터링, 메시징, 데이터베이스)를 식별함
2. **사용자 승인 필수 획득**:
   - 변경 목적, 영향 범위, 수정 대상 파일 목록을 정리하여 사용자에게 사전 검토 및 승인을 받음
3. **명세 작성 및 수정**:
   - `references/01_structure_and_naming.md` 및 `references/02_network_policy_and_security.md`에 정의된 네이밍 및 보안 규칙을 준수하여 YAML 파일을 편집함
4. **매니페스트 문법 검증**:
   - `references/03_deployment_and_validation.md`에 정의된 문법 검증(kubectl dry-run 등)을 실행함
5. **로컬 배포 및 모니터링**:
   - 로컬 테스트 클러스터(Minikube 등)에 배포 후 pod의 Liveness/Readiness probe 안정성을 관측함
