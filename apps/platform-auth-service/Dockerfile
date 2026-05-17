# 1. Base
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# 2. Pruner
FROM base AS pruner
COPY . .
RUN npx -y turbo@latest prune platform-auth-service --docker

# 3. Deps: 의존성 설치 레이어 (독립 캐시)
FROM base AS deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 4. Development: 개발 환경 (Skaffold Sync 및 NestJS Watch 모드용)
FROM deps AS development
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter="@pkg/*" build
ENV NODE_ENV=development
CMD ["pnpm", "--filter", "platform-auth-service", "run", "dev"]

# 5. Builder: Deps를 상속받아 node_modules 복사 시간 제거 (최적화 핵심)
FROM deps AS builder
COPY --from=pruner /app/out/full/ .
RUN --mount=type=cache,id=turbo,target=/app/.turbo/cache \
    npx turbo build --filter=platform-auth-service
RUN pnpm --filter platform-auth-service --prod deploy /app/deploy --ignore-scripts

# 5. Runner
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/deploy ./
COPY --from=builder --chown=node:node /app/apps/platform-auth-service/tsconfig.json ./tsconfig.json
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
