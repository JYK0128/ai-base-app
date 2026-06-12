# CQRS 도메인 및 디렉토리 구조

- 본 문서는 feature-first 기준의 CQRS 파일 배치와 역할 분리를 정의함
- 과도한 중첩을 피하고, 파일명만 보고도 역할이 파악되도록 유지함

---

## 1. feature-first 레이아웃

- CQRS 코드는 기능 또는 유스케이스 단위로 묶음
- 경로만 봐도 기능 경계가 보이도록 유지함
- 한 유스케이스에 속한 파일은 가까이 배치함

```text
domains/auth/
├── login/
│   ├── login.contract.ts
│   ├── login.error.ts
│   ├── login.handler.ts
│   ├── login.request.dto.ts
│   └── login.response.dto.ts
├── me/
│   ├── get-me.contract.ts
│   ├── get-me.error.ts
│   ├── get-me.handler.ts
│   ├── get-me.request.dto.ts
│   └── get-me.response.dto.ts
```

## 2. 공통 파일 역할

- `*.contract.ts`: 유스케이스용 메시지 또는 계약 클래스
- `*.handler.ts`: 오케스트레이션과 실행 흐름
- `*.error.ts`: 도메인 에러와 어서터 매핑
- `*.request.dto.ts` / `*.response.dto.ts`: 요청/응답 형태
- `*.event.ts`: 사실을 나타내는 이벤트 payload 또는 이벤트 객체

## 3. 중첩 규칙

- 기능 안에 명확한 하위 영역이 여러 개일 때만 하위 폴더를 둠
- 구조는 얕고 예측 가능하게 유지함
- 단일 유스케이스에 불필요한 폴더 레벨을 만들지 않음

## 4. export와 import

- feature-level export는 가능한 한 파일 가까이 둠
- feature 내부에서는 로컬 import 경로를 우선함
- barrel export는 읽기 쉬워질 때만 사용함

## 5. 모듈 통합

- 핸들러는 모듈에서 명시적으로 등록함
- 모듈 파일에는 wiring만 두고 비즈니스 로직은 넣지 않음

### 모듈 예시

```ts
@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [
    AuthCacheService,
    LoginHandler,
    RefreshTokenHandler,
    ChangePasswordHandler,
    DeferPasswordChangeHandler,
    GetMeHandler,
  ],
})
export class AuthModule {}
```
