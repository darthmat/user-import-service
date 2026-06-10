FROM node:24-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate && \
    pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-alpine AS app
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10 --activate && \
    pnpm config set store-dir /pnpm/store && \
    addgroup --system app && adduser --system --ingroup app app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=base /app/dist ./dist

USER app

EXPOSE 4000
CMD ["node", "dist/main.js"]