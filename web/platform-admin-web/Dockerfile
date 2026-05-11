# Stage 1: Prune
FROM node:24-alpine AS pruner
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app
COPY . .
RUN npx -y turbo@latest prune platform-admin-web --docker

# Stage 2: Builder
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# 의존성 설치
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# 실제 빌드
COPY --from=pruner /app/out/full/ .
RUN npx turbo build --filter=platform-admin-web

# Stage 3: Runner (Nginx)
FROM nginx:alpine
# build 결과물 위치: /app/web/platform-admin-web/dist
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
