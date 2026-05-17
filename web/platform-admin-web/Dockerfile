# 1. Base
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# 2. Pruner
FROM base AS pruner
COPY . .
RUN npx -y turbo@latest prune platform-admin-web --docker

# 3. Deps
FROM base AS deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 4. Development
FROM deps AS development
COPY --from=pruner /app/out/full/ .
ENV NODE_ENV=development
EXPOSE 5173
CMD ["pnpm", "--filter", "platform-admin-web", "run", "dev", "--", "--host"]

# 5. Builder: Deps를 상속받아 빌드 환경 구축
FROM deps AS builder
COPY --from=pruner /app/out/full/ .
RUN --mount=type=cache,id=turbo,target=/app/.turbo/cache \
    npx turbo build --filter=platform-admin-web

# 5. Runner (Nginx): 정적 파일 배포이므로 Nginx 전용 이미지 사용
FROM nginx:alpine
# 정적 파일만 추출하여 복사
COPY --from=builder /app/web/platform-admin-web/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
