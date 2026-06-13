FROM node:24-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate && \
    pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts --filter @user-import-service/api

COPY apps/api ./apps/api

RUN pnpm --filter @user-import-service/api build

FROM node:24-alpine AS api
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10 --activate && \
    pnpm config set store-dir /pnpm/store && \
    addgroup --system app && adduser --system --ingroup app app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --ignore-scripts --filter @user-import-service/api

COPY --from=base /app/apps/api/dist ./apps/api/dist

USER app

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]