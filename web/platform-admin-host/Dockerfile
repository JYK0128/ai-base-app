FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

COPY . .
RUN npx -y turbo@latest prune platform-admin-host --docker

FROM node:24-alpine AS installer
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm --filter platform-admin-host build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY --from=installer /app/web/platform-admin-host/dist ./

EXPOSE 80
