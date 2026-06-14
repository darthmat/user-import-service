FROM node:24-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate && \
    pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts --filter @user-import-service/web

COPY apps/web ./apps/web

RUN pnpm --filter @user-import-service/web build

FROM node:24-alpine AS web
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=base /app/apps/web/dist/standalone ./
COPY --from=base /app/apps/web/dist/static ./apps/web/dist/static

USER app

EXPOSE 3000
CMD ["node", "apps/web/server.js"]