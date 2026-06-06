---
name: monorepo-scaffolding-guide
description: 모노레포 내 신규 프로젝트/패키지 스캐폴딩 시 "base-package" 템플릿 구조 및 설정 준수 여부 검증 및 강제. 신규 패키지/앱 추가 또는 설정 복사 필요 시 사용.
---

# 모노레포 스캐폴딩 가이드 (Monorepo Scaffolding Guide)

- 모노레포의 표준화된 개발 환경 구축 및 유지를 위해 `base-package` 템플릿 사용을 강제함
- 실제 파일 생성/수정, 영향 범위 확인, 타입체크/린트/빌드 검증 시 `coding-change-workflow` 스킬을 함께 적용함

---

## 📋 상세 가이드 목차 (Table of Contents)

세부 표준 및 구축 절차: 아래 참조 파일을 `view_file`로 열어 확인

| 섹션 | 설명 | 참조 파일 |
| --- | --- | --- |
| 🛡️ 1. 프로젝트 표준 및 요구사항 | 템플릿 소스 위치, 설정 파일(package.json, eslint, tsconfig), 의존성 관리 및 K8s Probe에 맞춘 헬스체크 표준 | `references/01_standards_and_requirements.md` |
| 🔄 2. 구축 워크플로우 | 디렉토리 생성, 템플릿 복사, package.json 및 루트 tsconfig 설정 갱신, 검증 단계 및 스킬 트리거 안내 | `references/02_setup_workflow.md` |

---

## 🔄 워크플로우

1. **템플릿 준비**:
   - 신규 프로젝트 또는 패키지 추가 요청 시 `base-package` 템플릿 경로를 파악함
2. **참조 가이드 확인**:
   - `references/01_standards_and_requirements.md`에서 설정 규칙 및 헬스체크 사양을 확인함
3. **폴더 복사 및 구성**:
   - `references/02_setup_workflow.md` 단계에 따라 템플릿 파일을 신규 디렉토리에 복사하고 이름 및 설정을 변경함
4. **루트 연동 및 설치**:
   - 루트 `tsconfig.json`에 `references`를 연결하고 `pnpm install`을 실행함
5. **검증**:
   - `pnpm lint` 및 빌드 수행 후 실제 K8s 환경 배포 시 probe 오동작 여부를 확인함
