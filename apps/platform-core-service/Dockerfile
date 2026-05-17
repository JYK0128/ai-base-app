# 1. Base
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# 2. Pruner
FROM base AS pruner
COPY . .
RUN npx -y turbo@latest prune platform-core-service --docker

# 3. Deps
FROM base AS deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 4. Development
FROM deps AS development
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter="@pkg/*" build
ENV NODE_ENV=development
CMD ["pnpm", "--filter", "platform-core-service", "run", "dev"]

# 5. Builder
FROM deps AS builder
COPY --from=pruner /app/out/full/ .
RUN --mount=type=cache,id=turbo,target=/app/.turbo/cache \
    npx turbo build --filter=platform-core-service
RUN pnpm --filter platform-core-service --prod deploy /app/deploy --ignore-scripts

# 5. Runner
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/deploy ./
COPY --from=builder --chown=node:node /app/apps/platform-core-service/tsconfig.json ./tsconfig.json
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
