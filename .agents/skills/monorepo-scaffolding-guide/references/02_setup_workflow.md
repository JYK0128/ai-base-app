# 신규 프로젝트 구축 워크플로우 (Setup Workflow)

## 1. 구축 워크플로우 (Setup Workflow)

1. **디렉토리 생성**: `packages/` 또는 `apps/` 하위에 프로젝트 폴더 생성
2. **템플릿 복사**: `base-package` 내의 모든 파일을 신규 디렉토리로 복사
3. **package.json 최적화**: 프로젝트명 수정 및 버전 초기화 (`0.1.0`)
4. **루트 설정 업데이트**: 루트 디렉토리의 `tsconfig.json` 내 `references` 항목에 신규 프로젝트 경로 추가
5. **워크스페이스 등록**: 루트 디렉토리에서 `pnpm install` 실행하여 의존성 동기화
6. **헬스체크 구성**: 프로젝트 성격에 맞는 `/health/live`, `/health/ready` 및 probe 전략을 구성
7. **무결성 검증**: `pnpm lint` 또는 `npx eslint .`를 실행하여 설정 정상 작동 확인
8. **런타임 검증**: 배포 후 `kubectl describe pod`에서 probe 실패 이벤트가 없는지 확인

---

## 2. 스킬 트리거 (Trigger Phrases)

- 새로운 프로젝트/패키지/앱 생성 요청
- 워크스페이스 내 모듈 추가 시
- 신규 서비스 초기화 및 설정 지원 요청
