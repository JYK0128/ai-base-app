# Stage 1: Prune (빌드에 필요한 파일만 골라내기)
FROM node:24-alpine AS pruner
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app
COPY . .
RUN npx -y turbo@latest prune platform-auth-service --docker

# Stage 2: Builder (실제 빌드 수행)
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# Prune 단계에서 걸러진 package.json 및 lockfile들만 먼저 복사
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# 실제 소스 코드 복사 및 빌드
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter platform-auth-service build

# 실행에 필요한 핵심 파일만 추출 (격리 배포)
RUN pnpm --filter platform-auth-service --prod deploy /app/deploy --ignore-scripts --loglevel error

# Stage 3: Runner (최종 실행 이미지)
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production

# 빌드 결과물 복사 및 소유권 변경
COPY --from=builder --chown=node:node /app/deploy ./

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
